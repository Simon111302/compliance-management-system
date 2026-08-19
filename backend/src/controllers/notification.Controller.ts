import type { RequestHandler } from 'express'
import {
  listNotifications as listNotificationRecords,
  markAllNotificationsRead as markAllNotificationRecordsRead,
  markNotificationRead as markNotificationRecordRead,
} from '../services/notification.Service.js'

export const listNotifications: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    response.json(
      await listNotificationRecords(
        request.app.locals.database,
        request.user.userId,
      ),
    )
  } catch (error) {
    next(error)
  }
}

export const markNotificationRead: RequestHandler<{
  notificationId: string
}> = async (request, response, next) => {
  try {
    const notification = await markNotificationRecordRead(
      request.app.locals.database,
      request.user.userId,
      request.params.notificationId,
    )
    if (!notification) {
      response.status(404).json({ message: 'Notification not found' })
      return
    }

    response.json(notification)
  } catch (error) {
    next(error)
  }
}

export const markAllNotificationsRead: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    await markAllNotificationRecordsRead(
      request.app.locals.database,
      request.user.userId,
    )
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
