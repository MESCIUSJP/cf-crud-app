import { NextResponse, NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const config = { runtime: 'edge' };

/**
 * getDB関数は、CloudflareのコンテキストからDBを取得するヘルパー関数です。
 * DBが存在しない場合は、コンテキスト情報と共にエラーをスローします。
 */
function getDB(): D1Database {
  const context = getCloudflareContext(); // Cloudflareのリクエストコンテキストを取得
  const env = context.env as Env; // 環境設定から環境変数にキャスト
  if (!env.DB) { // DB情報が存在しない場合のチェック
    throw new Error(`DB not found; context: ${JSON.stringify(context)}`);
  }
  return env.DB; // DBを返す
}

/**
 * GETハンドラー:
 * 指定されたIDのInvoiceをデータベースから取得し、JSON形式で返します。
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const db = getDB(); // データベース接続を取得
    const id = (await params).Id; // ルートパラメータからIDを取得
    // Invoicesテーブルから指定されたIDのレコードを取得するSQLクエリを実行
    const { results } = await db.prepare('SELECT * FROM Invoices Where ID =?')
                              .bind(id)
                              .all();
    return NextResponse.json(results); // 結果をJSONで返す
  } catch (error) {
    console.error('Error in GET:', error); // エラーをログに出力
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 } // サーバー内部エラーを返す
    );
  }
}

/**
 * PUTハンドラー:
 * 指定されたIDのInvoiceの情報を更新します。
 * リクエストボディに更新対象のフィールドと値を含め、SQL UPDATEクエリを動的に構築して実行します。
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const db = getDB(); // データベース接続を取得
    const id = (await params).Id; // ルートパラメータからIDを取得
    // リクエストボディをJSONとして解析し、部分的なInvoice情報を取得
    const body = await request.json() as Partial<{
      BillNo: string;
      SlipNo: string;
      CustomerID: string;
      CustomerName: string;
      Products: string;
      Number: number;
      UnitPrice: number;
      Date: string;
    }>;
    const fieldsToUpdate: string[] = []; // 更新対象のフィールドを格納する配列
    const values: (string | number)[] = []; // SQLバインド用の値を格納する配列

    // 各フィールドが存在し、適切な値であれば対応するSQLの更新文を構築
    if (body.BillNo != null && body.BillNo.trim() !== "") {
      fieldsToUpdate.push("BillNo = ?");
      values.push(body.BillNo);
    }
    if (body.SlipNo != null && body.SlipNo.trim() !== "") {
      fieldsToUpdate.push("SlipNo = ?");
      values.push(body.SlipNo);
    }
    if (body.CustomerID != null && body.CustomerID.trim() !== "") {
      fieldsToUpdate.push("CustomerID = ?");
      values.push(body.CustomerID);
    }
    if (body.CustomerName != null && body.CustomerName.trim() !== "") {
      fieldsToUpdate.push("CustomerName = ?");
      values.push(body.CustomerName);
    }
    if (body.Products != null && body.Products.trim() !== "") {
      fieldsToUpdate.push("Products = ?");
      values.push(body.Products);
    }
    if (body.Number != null) {
      fieldsToUpdate.push("Number = ?");
      values.push(body.Number);
    }
    if (body.UnitPrice != null) {
      fieldsToUpdate.push("UnitPrice = ?");
      values.push(body.UnitPrice);
    }
    if (body.Date != null && body.Date.trim() !== "") {
      fieldsToUpdate.push("Date = ?");
      values.push(body.Date);
    }
    if (fieldsToUpdate.length === 0) {
      // 更新対象のフィールドが一つも提供されなかった場合、エラーレスポンスを返す
      return NextResponse.json({ error: 'No valid fields provided for update.' }, { status: 400 });
    }
    // 更新対象フィールドをカンマ区切りで連結し、動的にSQLのUPDATE文を構築
    const sql = `UPDATE Invoices SET ${fieldsToUpdate.join(", ")} WHERE ID = ?`;
    values.push(id); // 最後のバインドパラメータとしてIDを追加
    const result = await db.prepare(sql)
                           .bind(...values)
                           .run(); // SQLクエリを実行
    return NextResponse.json({ result }); // 結果をJSONで返す
  } catch (error) {
    console.error('Error in PUT:', error); // エラーをログに出力
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 } // サーバー内部エラーを返す
    );
  }
}

/**
 * DELETEハンドラー:
 * 指定されたIDのInvoiceをデータベースから削除します。
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const db = getDB(); // データベース接続を取得
    // ルートパラメータからIDを取得（コメントではCustomerIDと記載されていますが、実際にはInvoiceのIDです）
    const id = (await params).Id;

    // 指定されたIDのInvoiceを削除するSQLクエリを実行
    const result = await db.prepare('DELETE FROM Invoices WHERE ID = ?')
                        .bind(id)
                        .run();
    return NextResponse.json({ result }); // 結果をJSONで返す
  } catch (error) {
    console.error('Error in DELETE:', error); // エラーをログに出力
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 } // サーバー内部エラーを返す
    );
  }
}