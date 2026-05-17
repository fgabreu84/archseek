import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const placeIdsParam = searchParams.get('placeIds')

    let query = supabase
      .from('places')
      .select('id, name, description, architect, year_built, category, latitude, longitude, is_published, collection_id, collection:collections(name)')

    // Filter by selected IDs if provided
    if (placeIdsParam) {
      const placeIds = placeIdsParam.split(',').filter(id => id.trim())
      if (placeIds.length > 0) {
        query = query.in('id', placeIds)
      }
    }

    const { data: places, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!places || places.length === 0) {
      return NextResponse.json({ error: 'No places found' }, { status: 404 })
    }

    // Convert to Excel HTML format - readable and spacious
    const html = `
<html xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; margin-top: 30px; }
    th {
      background-color: #1a1a1a;
      color: white;
      border: 2px solid #333;
      padding: 18px;
      text-align: left;
      font-weight: bold;
      font-size: 14px;
      letter-spacing: 0.5px;
    }
    tr:nth-child(even) { background-color: #f5f5f5; }
    tr:nth-child(odd) { background-color: #ffffff; }
    td {
      border: 1px solid #ddd;
      padding: 20px 18px;
      font-size: 13px;
      line-height: 1.5;
      vertical-align: top;
    }
    .title { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
    .subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
    .description { word-wrap: break-word; white-space: pre-wrap; max-width: 500px; }
    .place-name { font-weight: 600; font-size: 14px; }
    .status-yes { color: #22863a; font-weight: 600; }
    .status-no { color: #cb2431; }
  </style>
</head>
<body>
  <div class="title">Architecture Places</div>
  <div class="subtitle">Generated: ${new Date().toLocaleString()}</div>

  <table>
    <thead>
      <tr>
        <th style="width: 220px;">PLACE NAME</th>
        <th style="width: 150px;">COLLECTION</th>
        <th style="width: 120px;">CATEGORY</th>
        <th style="width: 150px;">ARCHITECT</th>
        <th style="width: 80px;">YEAR</th>
        <th style="width: 500px;">DESCRIPTION</th>
        <th style="width: 100px;">PUBLISHED</th>
      </tr>
    </thead>
    <tbody>
      ${places.map((place: any) => `
      <tr>
        <td class="place-name">${(place.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
        <td>${(place.collection?.name || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
        <td>${place.category}</td>
        <td>${(place.architect || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
        <td style="text-align: center;">${place.year_built || '—'}</td>
        <td class="description">${(place.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</td>
        <td style="text-align: center;" class="${place.is_published ? 'status-yes' : 'status-no'}">${place.is_published ? '✓ YES' : 'NO'}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
    `.trim()

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="places-${new Date().toISOString().split('T')[0]}.xls"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
