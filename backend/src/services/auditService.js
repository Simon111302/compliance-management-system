export async function logAuditEvent(
  database,
  { action, entityType, entityId, details = {}, performedBy, performedByEmail },
) {
  const auditDocument = {
    action,
    entityType,
    entityId,
    details,
    performedBy,
    performedByEmail,
    createdAt: new Date(),
  }

  const result = await database.collection('auditLogs').insertOne(auditDocument)
  return { _id: result.insertedId, ...auditDocument }
}

export function serializeAuditLog(log) {
  return {
    ...log,
    userName: log.performedBy,
    userEmail: log.performedByEmail,
    entity: log.entityType,
    description:
      typeof log.details === 'string'
        ? log.details
        : (log.details?.description ?? ''),
  }
}

export async function listAuditEvents(database, limit) {
  let cursor = database.collection('auditLogs').find({}).sort({ createdAt: -1 })

  if (limit) cursor = cursor.limit(limit)

  const logs = await cursor.toArray()
  return logs.map(serializeAuditLog)
}
