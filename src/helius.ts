export type AccountData = {
	account: string
	nativeBalanceChange: number
	tokenBalanceChanges: any[]
}

export type TokenTransfer = {
	fromTokenAccount: string
	fromUserAccount: string
	mint: string
	toTokenAccount: string
	toUserAccount: string
	tokenAmount: number
	tokenStandard: string
}

export type EnhancedTx = {
	accountData: AccountData[]
	description: string
	events: any
	fee: number
	nativeTransfers: any[]
	signature: string
	feePayer: string
	slot: number
	source: string
	timestamp: number
	tokenTransfers: TokenTransfer[]
	type: string
}
