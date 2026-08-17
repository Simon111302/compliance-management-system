import { ObjectId, type Db } from 'mongodb'
import {
  createComplianceDocument,
  type ComplianceDocument,
  type ComplianceInput,
} from '../models/compliance.Model.js'

export type UpdateComplianceInput = Partial<
  Omit<ComplianceDocument, '_id' | 'id' | 'createdAt' | 'updatedAt'>
>

function compliances(database: Db) {
  return database.collection<ComplianceDocument>('compliances')
}

export function listCompliances(database: Db): Promise<ComplianceDocument[]> {
  return compliances(database).find({}).sort({ dueDate: 1 }).toArray()
}

export function getCompliance(
  database: Db,
  id: string,
): Promise<ComplianceDocument | null> {
  return compliances(database).findOne({ id })
}

export async function createCompliance(
  database: Db,
  input: ComplianceInput,
): Promise<ComplianceDocument> {
  const document: ComplianceDocument = {
    _id: new ObjectId(),
    ...createComplianceDocument(input),
  }

  await compliances(database).insertOne(document)
  return document
}

export async function updateCompliance(
  database: Db,
  id: string,
  input: UpdateComplianceInput,
): Promise<ComplianceDocument | null> {
  const existingCompliance = await getCompliance(database, id)
  if (!existingCompliance) return null

  const document: ComplianceDocument = {
    ...existingCompliance,
    ...input,
    id: existingCompliance.id,
    updatedAt: new Date(),
  }

  await compliances(database).replaceOne({ id }, document)
  return document
}

export async function deleteCompliance(
  database: Db,
  id: string,
): Promise<boolean> {
  const result = await compliances(database).deleteOne({ id })
  return result.deletedCount === 1
}
