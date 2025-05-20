import type { SheetItem, SheetResponse } from '../types/sheet'

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

export async function fetchSheetData(): Promise<SheetItem[]> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:B?key=${API_KEY}`,
    )

    if (!response.ok) {
      throw new Error('Failed to fetch sheet data')
    }

    const data: SheetResponse = await response.json()

    // Überspringe die Header-Zeile und konvertiere die Daten
    return data.values.slice(1).map((row) => ({
      title: row[0],
      imageUrl: row[1],
    }))
  } catch (error) {
    console.error('Error fetching sheet data:', error)
    return []
  }
}
