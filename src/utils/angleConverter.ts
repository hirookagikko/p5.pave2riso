/**
 * 度数法の角度をラジアンに変換
 * @param degrees - 度数法の角度
 * @returns ラジアン値
 */
export const degreesToRadians = (degrees: number): number => {
	return (degrees * Math.PI) / 180
}
