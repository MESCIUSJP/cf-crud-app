import { useState, useEffect } from 'react';

/**
 * 汎用ライセンスキーを読み込み適用するカスタムフック。
 * @param licenseModule ライセンスモジュール（setLicenseKey メソッドを持つオブジェクト）
 * @param product API パラメータ名（例: 'wijmo'）
 * @returns ライセンスが読み込み・適用されたら true を返します。
 */
export const useLicense = (
  licenseModule: { setLicenseKey: (key: string) => void },
  product: string,
): boolean => {
  const [isLoaded, setIsLoaded] = useState(false);
  const LICENSE_ENDPOINT = "/api/license"; // ライセンスキーAPIのパス

  useEffect(() => {
    if (isLoaded) return;

    const loadLicense = async () => {
      try {
        const res = await fetch(LICENSE_ENDPOINT + '/'+ product);
        const data = (await res.json()) as { licenseKey: string };
        licenseModule.setLicenseKey(data.licenseKey);
      } catch (err) {
        console.error('ライセンスの取得に失敗しました', product, err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadLicense();
  }, [isLoaded, licenseModule, product]);

  return isLoaded;
};

export default useLicense;