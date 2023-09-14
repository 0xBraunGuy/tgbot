import { sprintf } from 'sprintf-js'

// any labels to replace the wallet address
const KNOWN_ADDRESSES = {}

export const UI_PRECISION = 2

export class LinkType {
	static SolScanAccount = 'https://solscan.io/account/%s'
	static SolScanTx = 'https://solscan.io/tx/%s'
}

export class MarkdownFormatter {
	constructor(public builder: string = '') {}

	append(msg: any): MarkdownFormatter {
		this.builder = this.builder.concat(msg)
		return this
	}
	wrapBold(msg: any): MarkdownFormatter {
		this.builder = this.builder.concat(`*${msg}*`)
		return this
	}
	wrapItalic(msg: any): MarkdownFormatter {
		this.builder = this.builder.concat(`_${msg}_`)
		return this
	}
	wrapUnderline(msg: any): MarkdownFormatter {
		this.builder = this.builder.concat(`__${msg}__`)
		return this
	}

	newLine(): MarkdownFormatter {
		this.builder = this.builder.concat('\n')
		return this
	}

	url(display: string, val: string, linkType: LinkType): MarkdownFormatter {
		this.builder = this.builder.concat(`[${display}](${sprintf(linkType, val)})`)
		return this
	}

	build(): string {
		let cleaned = this.builder.replace(/\./g, '\\.')
		console.log('after', cleaned)
		return cleaned
	}
}
export class MessageBuilder {
	static async build(
		formatter: MarkdownFormatter,
		data: {
			from: string
			to: string
			amount: number
			tx: string
			description: string
			includeTags: boolean
			includeBBalances: boolean
			includeSOLBalances: boolean
		},
	): Promise<string> {
		return formatter
			.wrapBold(getTitle(data.amount!))
			.append(': ')
			.url(data.tx?.substring(0, 30) + '...', data.tx!, LinkType.SolScanTx)
			.newLine()
			.wrapBold('From: ')
			.append(getAddressLabel(data.from, 4))
			.newLine()
			.wrapBold('To: ')
			.append(getAddressLabel(data.to, 4))
			.newLine()
			.build()
	}
}

function getAddressLabel(key: string, len: number = 6): string {
	let display = ''
	if (KNOWN_ADDRESSES[key] != null && KNOWN_ADDRESSES != undefined) {
		display = KNOWN_ADDRESSES[key]
	} else {
		display = shortKey(key, len)
	}

	return `[${display}](${sprintf(LinkType.SolScanAccount, key)})`
}

function shortKey(key: string, len: number = 6): string {
	return key.substring(0, len) + '...' + key.substring(key.length - len)
}

function getTitle(amount: number): string {
	let numStr = formatNumber(amount)
	return sprintf('transfer %s', numStr)
}

function formatNumber(amount: number | undefined): string {
	if (amount == undefined) {
		return '??'
	}

	if (amount >= 1_000_000_000_000) {
		return (amount / 1_000_000_000_000).toFixed(UI_PRECISION) + ' T'
	} else if (amount >= 1_000_000_000) {
		return (amount / 1_000_000_000).toFixed(UI_PRECISION) + ' B'
	} else if (amount >= 1_000_000) {
		return (amount / 1_000_000).toFixed(UI_PRECISION) + ' M'
	} else if (amount >= 1_000) {
		return (amount / 1_000).toFixed(UI_PRECISION) + ' K'
	}
	return amount.toFixed(UI_PRECISION)
}
