import { hashPassword } from '../utils/crypto.js'
import { createReviewerActionDocument } from '../models/reviewerActionModel.js'
import { listAuditEvents, logAuditEvent } from '../services/auditService.js'
import {
  parseObjectId,
  validateCreateUser,
  validateResetPassword,
  validateReviewerAction,
  validateUpdateUser,
  validationMessage,
} from '../validators/adminValidators.js'

function serializeUser(user) {
  const { passwordHash: _passwordHash, ...safeUser } = user
  return safeUser
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function userDocument(
  input,
  passwordHash,
  status = 'Active',
  createdAt = new Date(),
) {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()

  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email: normalizeEmail(input.email),
    passwordHash,
    status,
    role: input.role,
    createdAt,
  }
}

function userUpdate(input, existingUser) {
  return userDocument(
    input,
    existingUser.passwordHash,
    existingUser.status ?? 'Active',
    existingUser.createdAt ?? new Date(),
  )
}

function auditIdentity(request) {
  return {
    performedBy: request.user?._id,
    performedByEmail: request.user?.email,
  }
}

async function auditMutation(
  database,
  request,
  action,
  entityType,
  entityId,
  description,
) {
  await logAuditEvent(database, {
    action,
    entityType,
    entityId,
    details: { description },
    ...auditIdentity(request),
  })
}

function sendValidationError(response, validation) {
  response.status(400).json({ message: validationMessage(validation) })
}

function handleDuplicate(error, response, next, field) {
  if (error?.code === 11000) {
    response.status(400).json({ message: `${field} already exists` })
    return
  }

  next(error)
}

export async function getDashboard(request, response, next) {
  try {
    const database = request.app.locals.database
    const users = database.collection('users')
    const [totalUsers, reviewers, reporters, issues] = await Promise.all([
      users.countDocuments({
        role: { $in: ['Admin', 'Reviewer', 'Reporter'] },
      }),
      users.countDocuments({ role: 'Reviewer' }),
      users.countDocuments({ role: 'Reporter' }),
      database
        .collection('compliances')
        .countDocuments({ status: { $ne: 'Approved' } }),
    ])

    response.json({
      summary: {
        totalUsers,
        reviewers,
        reporters,
        complianceIssues: issues,
      },
      recentActivity: await listAuditEvents(database, 10),
    })
  } catch (error) {
    next(error)
  }
}

export async function listUsers(request, response, next) {
  try {
    const users = await request.app.locals.database
      .collection('users')
      .find({})
      .sort({ createdAt: -1, name: 1 })
      .toArray()

    response.json(users.map(serializeUser))
  } catch (error) {
    next(error)
  }
}

export async function createUser(request, response, next) {
  const validation = validateCreateUser(request.body)
  if (!validation.valid) {
    sendValidationError(response, validation)
    return
  }

  try {
    const database = request.app.locals.database
    const document = userDocument(
      request.body,
      hashPassword(request.body.password),
    )
    const result = await database.collection('users').insertOne(document)
    const createdUser = { _id: result.insertedId, ...document }

    await auditMutation(
      database,
      request,
      'CREATE',
      'User',
      result.insertedId,
      `Created user ${document.email}`,
    )
    response.status(201).json(serializeUser(createdUser))
  } catch (error) {
    handleDuplicate(error, response, next, 'email')
  }
}

export async function updateUser(request, response, next) {
  const userId = parseObjectId(request.params.id)
  if (!userId) {
    response.status(400).json({ message: 'User id must be a valid ObjectId' })
    return
  }

  const validation = validateUpdateUser(request.body)
  if (!validation.valid) {
    sendValidationError(response, validation)
    return
  }

  try {
    const database = request.app.locals.database
    const users = database.collection('users')
    const existingUser = await users.findOne({ _id: userId })

    if (!existingUser) {
      response.status(404).json({ message: 'User not found' })
      return
    }

    const document = userUpdate(request.body, existingUser)
    await users.replaceOne({ _id: userId }, document)

    if (document.status === 'Inactive') {
      await database.collection('sessions').deleteMany({ userId })
    }

    await auditMutation(
      database,
      request,
      'UPDATE',
      'User',
      userId,
      `Updated user ${document.email}`,
    )
    response.json(serializeUser({ _id: userId, ...document }))
  } catch (error) {
    handleDuplicate(error, response, next, 'email')
  }
}

export async function resetUserPassword(request, response, next) {
  const userId = parseObjectId(request.params.id)
  if (!userId) {
    response.status(400).json({ message: 'User id must be a valid ObjectId' })
    return
  }

  const validation = validateResetPassword(request.body)
  if (!validation.valid) {
    sendValidationError(response, validation)
    return
  }

  try {
    const database = request.app.locals.database
    const result = await database
      .collection('users')
      .updateOne(
        { _id: userId },
        { $set: { passwordHash: hashPassword(request.body.password) } },
      )

    if (!result.matchedCount) {
      response.status(404).json({ message: 'User not found' })
      return
    }

    await database.collection('sessions').deleteMany({ userId })
    await auditMutation(
      database,
      request,
      'RESET_PASSWORD',
      'User',
      userId,
      'Reset user password and revoked active sessions',
    )
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}

export async function deleteUser(request, response, next) {
  const userId = parseObjectId(request.params.id)
  if (!userId) {
    response.status(400).json({ message: 'User id must be a valid ObjectId' })
    return
  }

  try {
    const database = request.app.locals.database
    const user = await database.collection('users').findOne({ _id: userId })

    if (!user) {
      response.status(404).json({ message: 'User not found' })
      return
    }

    await database.collection('users').deleteOne({ _id: userId })
    await database.collection('sessions').deleteMany({ userId })
    await auditMutation(
      database,
      request,
      'DELETE',
      'User',
      userId,
      `Deleted user ${user.email}`,
    )
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}

export async function listReviewerActions(request, response, next) {
  try {
    const actions = await request.app.locals.database
      .collection('reviewerActions')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    response.json(actions)
  } catch (error) {
    next(error)
  }
}

export async function createReviewerAction(request, response, next) {
  const validation = validateReviewerAction(request.body)
  if (!validation.valid) {
    sendValidationError(response, validation)
    return
  }

  try {
    const database = request.app.locals.database
    const reviewerId = parseObjectId(request.body.reviewerId)
    const reviewer = await database.collection('users').findOne({
      _id: reviewerId,
      role: 'Reviewer',
    })

    if (!reviewer) {
      response.status(404).json({ message: 'Reviewer not found' })
      return
    }

    const document = createReviewerActionDocument(
      request.body,
      reviewer,
      request.user._id,
    )
    const result = await database
      .collection('reviewerActions')
      .insertOne(document)

    await auditMutation(
      database,
      request,
      'CREATE',
      'Reviewer Action',
      result.insertedId,
      `${document.type} issued to ${document.reviewerEmail}`,
    )
    response.status(201).json({ _id: result.insertedId, ...document })
  } catch (error) {
    next(error)
  }
}

export async function updateReviewerAction(request, response, next) {
  const actionId = parseObjectId(request.params.id)
  if (!actionId) {
    response.status(400).json({ message: 'Action id must be a valid ObjectId' })
    return
  }

  const validation = validateReviewerAction(request.body)
  if (!validation.valid) {
    sendValidationError(response, validation)
    return
  }

  try {
    const database = request.app.locals.database
    const actions = database.collection('reviewerActions')
    const existingAction = await actions.findOne({ _id: actionId })
    const reviewerId = parseObjectId(request.body.reviewerId)
    const reviewer = await database.collection('users').findOne({
      _id: reviewerId,
      role: 'Reviewer',
    })

    if (!existingAction || !reviewer) {
      response.status(404).json({ message: 'Reviewer action not found' })
      return
    }

    const document = createReviewerActionDocument(
      request.body,
      reviewer,
      existingAction.createdBy,
      existingAction.createdAt,
    )
    await actions.replaceOne({ _id: actionId }, document)
    await auditMutation(
      database,
      request,
      'UPDATE',
      'Reviewer Action',
      actionId,
      `Updated ${document.type} for ${document.reviewerEmail}`,
    )
    response.json({ _id: actionId, ...document })
  } catch (error) {
    next(error)
  }
}

export async function deleteReviewerAction(request, response, next) {
  const actionId = parseObjectId(request.params.id)
  if (!actionId) {
    response.status(400).json({ message: 'Action id must be a valid ObjectId' })
    return
  }

  try {
    const database = request.app.locals.database
    const action = await database
      .collection('reviewerActions')
      .findOne({ _id: actionId })

    if (!action) {
      response.status(404).json({ message: 'Reviewer action not found' })
      return
    }

    await database.collection('reviewerActions').deleteOne({ _id: actionId })
    await auditMutation(
      database,
      request,
      'DELETE',
      'Reviewer Action',
      actionId,
      `Deleted ${action.type} for ${action.reviewerEmail}`,
    )
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}

export async function listAuditLogs(request, response, next) {
  try {
    response.json(await listAuditEvents(request.app.locals.database))
  } catch (error) {
    next(error)
  }
}
