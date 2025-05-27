'use client';

/**
 * FlexGrid.tsx
 * Wijmo FlexGridを使用した請求書管理用グリッド。
 */
import React from "react";
import "@mescius/wijmo.styles/wijmo.css";
import * as WjCore from "@mescius/wijmo";
import * as wjGrid from '@mescius/wijmo.react.grid.multirow';
import "@mescius/wijmo.cultures/wijmo.culture.ja";
import { CollectionViewNavigator } from "@mescius/wijmo.react.input";

import useLicense from '../hooks/useLicense';

const INVOICES_ENDPOINT = "/api/Invoices"; // 請求書APIのパス

/**
 * 請求書レコードの型定義。
 */
export interface InvoiceRecord {
  ID: number;
  BillNo: string;
  SlipNo: string;
  CustomerID: string;
  CustomerName: string;
  Products: string;
  Number: number;
  UnitPrice: number;
  Date: string;
}

/**
 * ページングおよびフィルタ可能なグリッドで請求書データを表示するFlexGridコンポーネント。
 * 追加、編集、削除、およびサーバーへの変更反映に対応します。
 */
/**
 * ページングおよびフィルタ可能なグリッドで請求書データを表示するFlexGridコンポーネント。
 * 追加、編集、削除、およびサーバーへの変更反映に対応します。
 */
function MultiRowGrid() {
  const isLicenseLoaded = useLicense(WjCore, 'wijmo');
  const [invoices, setInvoices] = React.useState<WjCore.CollectionView<InvoiceRecord>>(
    new WjCore.CollectionView<InvoiceRecord>([], {
      trackChanges: true,
      pageSize: 4,
    })
  );

  React.useEffect(() => {
    if (!isLicenseLoaded) return;
    WjCore.httpRequest(INVOICES_ENDPOINT, {
      success: (xhr) => {
        const data = JSON.parse(xhr.response) as InvoiceRecord[];
        setInvoices(
          new WjCore.CollectionView<InvoiceRecord>(data, {
            trackChanges: true,
            pageSize: 4,
          })
        );
      },
      error: (err) => console.error("invoicesデータの取得に失敗しました:", err),
    });
  }, [isLicenseLoaded]);

  if (!isLicenseLoaded) {
    return <div>Loading license...</div>;
  }

  const handleUpdate = async () => {
    const edited = invoices.itemsEdited;
    const added = invoices.itemsAdded;
    const removed = invoices.itemsRemoved;

    if (edited.length === 0 && added.length === 0 && removed.length === 0) {
      alert("変更されたデータがありません。");
      return;
    }

    try {
      edited.forEach(item =>
        WjCore.httpRequest(INVOICES_ENDPOINT +'/' + item.ID, { method: "PUT", data: item })
      );
      added.forEach(item =>
        WjCore.httpRequest(INVOICES_ENDPOINT, { method: "POST", data: item })
      );
      removed.forEach(item =>
        WjCore.httpRequest(INVOICES_ENDPOINT +'/' + item.ID, { method: "DELETE" })
      );

      if (edited.length) alert(`${edited.length}件のデータを更新しました。`);
      if (added.length) alert(`${added.length}件のデータを登録しました。`);
      if (removed.length) alert(`${removed.length}件のデータを削除しました。`);
    } catch (err) {
      console.error("更新中にエラーが発生しました。:", err);
      alert("更新中にエラーが発生しました。");
    } finally {
      invoices.clearChanges();
    }
  };

  return (
    <div>
      <div>
        <button onClick={handleUpdate} className="btn">更新</button>
        <CollectionViewNavigator headerFormat="{currentPage:n0} / {pageCount:n0} ページ" byPage={true} cv={invoices}/>
      </div>
      <div className="multirow-grid-container">
        <wjGrid.MultiRow itemsSource={invoices} allowAddNew={true} allowDelete={true}>
          <wjGrid.MultiRowCellGroup header="請求書情報">
            <wjGrid.MultiRowCell binding="ID" header="ID" width={70} />
            <wjGrid.MultiRowCell binding="BillNo" header="請求書番号" width={150} />
            <wjGrid.MultiRowCell binding="SlipNo" header="伝票番号" width={150} />
          </wjGrid.MultiRowCellGroup>
          <wjGrid.MultiRowCellGroup header="顧客情報">
            <wjGrid.MultiRowCell binding="CustomerID" header="顧客ID" width={100} />
            <wjGrid.MultiRowCell binding="CustomerName" header="顧客名" width={200} />
          </wjGrid.MultiRowCellGroup>
          <wjGrid.MultiRowCellGroup header="明細情報">
            <wjGrid.MultiRowCell binding="Products" header="商品" width={250} />
            <wjGrid.MultiRowCell binding="Number" header="数量" width={80} />
            <wjGrid.MultiRowCell binding="UnitPrice" header="単価" width={100} format="c" />
            <wjGrid.MultiRowCell binding="Date" header="日付" width={120} />
          </wjGrid.MultiRowCellGroup>
        </wjGrid.MultiRow>
      </div>
    </div>
  );
};

export default MultiRowGrid;
