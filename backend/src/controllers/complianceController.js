import { validateReviewInput } from '../validators/requestValidators.js'

function collection(request) {
  return request.app.locals.database.collection('compliances')
}

function withoutMongoId(document) {
  const { _id, ...compliance } = document
  return compliance
}

export async function listCompliances(request, response, next) {
  try {
    const compliances = await collection(request)
      .find()
      .sort({ id: 1 })
      .toArray()
    response.json(compliances.map(withoutMongoId))
  } catch (error) {
    next(error)
  }
}

export async function createCompliance(request, response, next) {
  try {
    await collection(request).insertOne(request.body)
    response.status(201).json(request.body)
  } catch (error) {
    next(error)
  }
}

export async function replaceCompliance(request, response, next) {
  try {
    const compliance = { ...request.body, id: request.params.id }
    const result = await collection(request).replaceOne(
      { id: request.params.id },
      compliance,
    )

    if (!result.matchedCount) {
      response.status(404).json({ message: 'Compliance not found' })
      return
    }

    response.json(compliance)
  } catch (error) {
    next(error)
  }
}

export async function reviewCompliance(request, response, next) {
  try {
    const { decision } = request.body

    if (!validateReviewInput(decision)) {
      response.status(400).json({ message: 'Invalid review decision' })
      return
    }

    const statuses = {
      Approve: 'Approved',
      Partial: 'Partial',
      Reject: 'Rejected',
    }
    const result = await collection(request).findOneAndUpdate(
      { id: request.params.id },
      {
        $set: {
          status: statuses[decision],
          reviewerComments: request.body.comments?.trim() ?? '',
        },
      },
      { returnDocument: 'after' },
    )

    if (!result) {
      response.status(404).json({ message: 'Compliance not found' })
      return
    }

    response.json(withoutMongoId(result))
  } catch (error) {
    next(error)
  }
}
