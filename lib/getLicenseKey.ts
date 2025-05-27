import 'server-only'

/**
 * ライセンスキーを取得するユーティリティ関数。
 * @param product ライセンスプロダクト名
 * @returns ライセンスキー
 */
export function getLicenseKey(product: string): string {
  switch (product) {
    case 'wijmo':
      return process.env.WIJMO_LICENSE_KEY ?? 'default-wijmo-license-key';
    case 'activereportsjs':
      return process.env.ACTIVEREPORTSJS_LICENSE_KEY ?? 'default-activereportsjs-license-key';
    default:
      return 'default-license-key';
  }
}