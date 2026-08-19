import { ObjectId, type Db } from 'mongodb'
import type { RoleDocument } from '../models/role.Model.js'
import {
  createNotificationDocument,
  type NotificationDocument,
  type NotificationInput,
} from '../models/notification.Model.js'

function notifications(database: Db) {
  return database.collection<NotificationDocument>('notifications')
}

export async function listActiveReviewerIds(database: Db): Promise<string[]> {
  const activeReviewers = await database
    .collection<RoleDocument>('roles')
    .aggregate<{ userId: string }>([
      { $match: { type: 'reviewr' } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'userId',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: { 'user.status': { $ne: 'Inactive' } } },
      { $project: { _id: 0, userId: 1 } },
    ])
    .toArray()

  return activeReviewers.map((reviewer) => reviewer.userId)
}

export function listNotifications(
  database: Db,
  userId: string,
): Promise<NotificationDocument[]> {
  return notifications(database)
    .find({ userId })
    .sort({ createdAt: -1, _id: -1 })
    .limit(20)
    .toArray()
}

export async function createNotifications(
  database: Db,
  inputs: NotificationInput[],
): Promise<void> {
  if (inputs.length === 0) return

  await notifications(database).insertMany(
    inputs.map((input) => ({
      _id: new ObjectId(),
      ...createNotificationDocument(input),
    })),
  )
}

export function markNotificationRead(
  database: Db,
  userId: string,
  notificationId: string,
): Promise<NotificationDocument | null> {
  return notifications(database).findOneAndUpdate(
    { notificationId, userId },
    { $set: { readAt: new Date() } },
    { returnDocument: 'after' },
  )
}

export async function markAllNotificationsRead(
  database: Db,
  userId: string,
): Promise<void> {
  await notifications(database).updateMany(
    { userId, readAt: null },
    { $set: { readAt: new Date() } },
  )
}
