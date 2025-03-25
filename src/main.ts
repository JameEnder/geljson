import { basicSetup } from 'codemirror'
import { EditorView } from '@codemirror/view'
import { json } from '@codemirror/lang-json'
import { tokyoNightStorm } from '@uiw/codemirror-theme-tokyo-night-storm'

const formattingTable = {
	tab: '\t',
	'space-2': '  ',
	'space-4': '    ',
}

const formatJsonToLiteral = (
	json: any,
	pretty = false,
	level = 0,
	format: 'tab' | 'space-2' | 'space-4' = 'tab'
): string => {
	const f = formattingTable[format]

	if (typeof json === 'string') {
		return `"${json}"`
	} else if (typeof json === 'number') {
		return json.toString()
	} else if (typeof json === 'boolean') {
		return json ? 'true' : 'false'
	} else if (json === null) {
		return '{}'
	} else if (json instanceof Array) {
		return (
			`[${pretty ? '\n' + f.repeat(level + 1) : ''}` +
			json
				.map((j) => formatJsonToLiteral(j, pretty, level + 1, format))
				.join(`, ${pretty ? '\n' + f.repeat(level + 1) : ''}`) +
			`${pretty ? '\n' + f.repeat(Math.max(0, level)) : ''}]`
		)
	} else {
		return (
			`(${pretty ? '\n' + f.repeat(level + 1) : ''}` +
			Object.entries(json)
				.map(
					([key, value]) =>
						`${key} := ${formatJsonToLiteral(value, pretty, level + 1, format)}`
				)
				.join(`, ${pretty ? '\n' + f.repeat(level + 1) : ''}`) +
			`${pretty ? '\n' + f.repeat(Math.max(0, level)) : ''})`
		)
	}
}

const jsonView = new EditorView({
	doc: JSON.stringify(
		{
			name: 'John Doe',
			age: 30,
			isStudent: true,
			hobbies: ['coding', 'reading', 'running'],
			address: {
				street: '123 Main St',
				city: 'Anytown',
				state: 'CA',
				zip: 12345,
			},
		},
		null,
		4
	),
	parent: document.getElementById('json')!,
	extensions: [basicSetup, json(), tokyoNightStorm, EditorView.lineWrapping],
})

const literalView = new EditorView({
	doc: '',
	parent: document.getElementById('literal')!,
	extensions: [basicSetup, tokyoNightStorm, EditorView.lineWrapping],
})

const toggleFormatSelect = (pretty: boolean) => {
	if (pretty) {
		document.getElementById('format-select')!.classList.remove('hidden')
		document.getElementById('format-select')!.classList.add('flex')
	} else {
		document.getElementById('format-select')!.classList.add('hidden')
		document.getElementById('format-select')!.classList.remove('flex')
	}
}

const pretty = document.getElementById('pretty') as HTMLInputElement

toggleFormatSelect(pretty.checked)

pretty.addEventListener('change', () => toggleFormatSelect(pretty.checked))

document.getElementById('parse')!.addEventListener('click', () => {
	try {
		const parsed = JSON.parse(jsonView.state.doc.toString())
		const pretty = (document.getElementById('pretty') as HTMLInputElement)!.checked
		const format = (document.getElementById('format') as HTMLSelectElement)!.value
		const formatted = formatJsonToLiteral(parsed, pretty, 0, format as any)

		literalView.dispatch({
			changes: {
				from: 0,
				to: literalView.state.doc.length,
				insert: formatted,
			},
		})
	} catch (err: any) {
		literalView.dispatch({
			changes: {
				from: 0,
				to: literalView.state.doc.length,
				insert: err.toString(),
			},
		})
	}
})
