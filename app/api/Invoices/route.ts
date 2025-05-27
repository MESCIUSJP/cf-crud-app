import {NextRequest, NextResponse } from 'next/server';
import {getCloudflareContext } from '@opennextjs/cloudflare';

// Next.js Edge Runtime の設定
// この設定により、APIルートが Cloudflare Edge 上で実行されます。
export const config = { runtime: 'edge' };

/**
 * Cloudflare のコンテキストからデータベース接続オブジェクトを取得する関数
 * - Cloudflare 環境変数 (env) から DB を取り出す
 * - DB が存在しない場合、コンテキスト情報を含むエラーをスローする
 */
function getDB(): D1Database {
    // Cloudflare 用のコンテキストを取得
    const context = getCloudflareContext();
    // 環境変数として設定された DB オブジェクトを取得（型キャストを実施）
    const env = context.env as Env;
    // DB が存在しない場合は、コンテキスト情報をデバッグ用にエラーとして出力
    if (!env.DB) {
      throw new Error(`DB not found; context: ${JSON.stringify(context)}`);
    }
    // 正常な場合は DB オブジェクトを返す
    return env.DB;
}

/**
 * GET リクエストハンドラ
 * - クライアントからの GET リクエストを受け付け、Invoices テーブルの全レコードを取得
 * - 正常時は取得結果を JSON レスポンスとして返す
 * - エラー発生時は、エラーメッセージを含む JSON レスポンス（500 ステータス）を返す
 */
export async function GET() {
    try {
      // データベース接続を確立
      const db = getDB();
      // SQL クエリを実行し、Invoices テーブルから全レコードを取得
      const { results } = await db.prepare('SELECT * FROM Invoices').all();
      // 取得したレコードを JSON レスポンスとしてクライアントに返す
      return NextResponse.json(results);
    } catch (error) {
      // エラー発生時にエラーログをコンソールへ出力
      console.error('Error in GET:', error);
      // エラーメッセージとともに 500 ステータスの JSON レスポンスを返す
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
}

/**
 * POST リクエストハンドラ
 * - クライアントからの POST リクエストを受け付け、新規の Invoice レコードをデータベースに挿入
 * - リクエストボディから billNo, slipNo, customerId, customerName, products, quantity, unitPrice, date の各パラメータを抽出
 * - 必要なパラメータがすべて存在するか検証し、不足している場合は 400 ステータスのエラーを返す
 * - 全パラメータ存在時は、INSERT クエリを実行してレコードを追加し、結果を JSON として返す
 * - エラー発生時は、エラーメッセージを含む JSON レスポンス（500 ステータス）を返す
 */
export async function POST(request: NextRequest) {
    try {
      // データベース接続を確立
      const db = getDB();
      // リクエストの詳細をコンソールに出力（デバッグ用）
      console.log('request:', request);
      // リクエストボディを JSON としてパースし、必要なパラメータを抽出
      const body = await request.json() as {
        ID: number
        BillNo: string
        SlipNo: string
        CustomerID: string
        CustomerName: string
        Products: string
        Number: number
        UnitPrice: number
        Date: string
      };
      // 分割代入により、各パラメータを変数に代入
      const {ID, BillNo, SlipNo, CustomerID, CustomerName, Products, Number, UnitPrice, Date } = body;
      // 全てのパラメータの検証
      if (
        ID === undefined || ID === null ||
        BillNo === undefined || BillNo === null ||
        SlipNo === undefined || SlipNo === null ||
        CustomerID === undefined || CustomerID === null ||
        CustomerName === undefined || CustomerName === null ||
        Products === undefined || Products === null ||
        Number === undefined || Number === null ||
        UnitPrice === undefined || UnitPrice === null ||
        Date === undefined || Date === null
      ) {
        // パラメータ不足の場合、エラーメッセージとともに 400 ステータスの JSON レスポンスを返す
        return NextResponse.json(
          { error: 'Invalid request. All parameters required: ID, BillNo, SlipNo, CustomerID, CustomerName, Products, Number, UnitPrice, Date' },
          { status: 400 }
        );
      }
      // SQL クエリを用いて Invoices テーブルへ新規レコードを挿入
      // プレースホルダを使用し、バインドにより値を安全に挿入（SQL インジェクション対策）
      const result = await db
        .prepare(
          "INSERT INTO Invoices (id, BillNo, SlipNo, CustomerID, CustomerName, Products, Number, UnitPrice, Date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(ID, BillNo, SlipNo, CustomerID, CustomerName, Products, Number, UnitPrice, Date)
        .run();
      // 挿入結果を JSON レスポンスとして返す
      return NextResponse.json({ result });
    } catch (error) {
      // エラー発生時は、エラーログをコンソールへ出力
      console.error('Error in POST:', error);
      // エラーメッセージを含む JSON レスポンス（500 ステータス）を返す
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
}