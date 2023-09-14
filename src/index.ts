import { json } from 'body-parser'
import express from 'express'
import TelegramBot, { ParseMode } from 'node-telegram-bot-api'
import { MarkdownFormatter, MessageBuilder } from './format'
import { EnhancedTx, TokenTransfer } from './helius'

const channel = process.env.TG_CHANNEL as string
const token = process.env.TG_AUTH_TOKEN as string

const TG_PARSE_MODE: ParseMode = 'MarkdownV2'
const bot = new TelegramBot(token, { polling: false })

// Initialize express and define a port
const app = express()
const PORT = 3000
// Tell express to use body-parser's JSON parsing
app.use(json())
// Start express on the defined port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))

app.post('/hook', async (req, res) => {
	const txs: EnhancedTx[] = req.body

	for (const tx of txs) {
		console.log(
			'recieved',
			tx.signature,
			tx.tokenTransfers
				.sort((a, b) => Number(a.tokenAmount) - Number(b.toTokenAccount))
				.map((v) => v.tokenAmount)[0],
		)
		const body = await filterForMessageOrNull(tx)
		if (body) {
			await sendMsg(body)
		}
	}

	res.status(200).end()
})

export async function getMessage(
	mode: ParseMode,
	tx: EnhancedTx,
	transfer: TokenTransfer,
): Promise<string> {
	// TODO html vs markdown switch here
	const formatter = new MarkdownFormatter()
	return await MessageBuilder.build(formatter, {
		from: transfer.fromUserAccount,
		to: transfer.toUserAccount,
		amount: transfer.tokenAmount,
		tx: tx.signature,
		description: tx.description,
		includeTags: true,
		includeBBalances: true,
		includeSOLBalances: true,
	})
}

/**
 * filter the transfers and decide to send the message or not, return the formatted body message
 * 
 * @param tx 
 * @returns 
 */
export async function filterForMessageOrNull(tx: EnhancedTx): Promise<string | null> {
	for (let transfer of tx.tokenTransfers) {
		if (shouldSendMsg(transfer)) {
			const body = await getMessage(TG_PARSE_MODE, tx, transfer)
			console.log(body)
			return body
		}
	}

	return null
}

/**
 *
 * send a pre-formatted messagse
 *
 * @param body
 */
export async function sendMsg(body: string) {
	bot.sendMessage(channel, body, {
		parse_mode: TG_PARSE_MODE,
		disable_web_page_preview: true,
	})
}

/**
 * filter for messages to be sent
 *
 * @param transfer
 * @returns
 */
export function shouldSendMsg(transfer: TokenTransfer): boolean {
	return true
}
