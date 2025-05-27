'use client';

import { Core } from "@mescius/activereportsjs";  // ActiveReportsJSのCoreライブラリを読み込み、ライセンス設定などに使用
import { Viewer,Props as ViewerProps} from "@mescius/activereportsjs-react"; // ActiveReportsJSViewerコンポーネント,Props型のインポート
import "@mescius/activereportsjs/pdfexport";      // PDFエクスポートモジュール
import "@mescius/activereportsjs-i18n";           // ローカライズモジュール

import useLicense from '../hooks/useLicense';
import React, { useEffect, useRef } from "react"; 

// ActiveReportsJSのCSS設定
import "@mescius/activereportsjs/styles/ar-js-ui.css";
import "@mescius/activereportsjs/styles/ar-js-viewer.css";


// ViewerWrapper コンポーネント
const ViewerWrapper = (props: ViewerWrapperProps) => {
  // ライセンス読み込み状態
  const isLicenseLoaded = useLicense(Core, 'activereportsjs');
  // Viewerコンポーネントにアクセスするためのrefを作成
  const viewerRef = useRef<Viewer>(null);

  useEffect(() => {
    if (isLicenseLoaded && viewerRef.current) {
      viewerRef.current.Viewer.open(props.reportUri);
    }
  }, [props.reportUri, isLicenseLoaded]);

  // ライセンスが読み込まれるまでは、ローディングメッセージを表示
  if (!isLicenseLoaded) {
    return <div>Loading license...</div>;
  }

  // Viewerレンダリング
  return <Viewer {...props} ref={viewerRef} />;
};

// ViewerWrapperProps型
export type ViewerWrapperProps = ViewerProps & { reportUri: string };

// ViewerWrapperコンポーネントをデフォルトエクスポート
export default ViewerWrapper;