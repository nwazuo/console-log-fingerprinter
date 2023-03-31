// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { generateString } from './utils';

function fingerPrintWorkspaceEdit(document: vscode.TextDocument, range: vscode.Range) {
	let fpWorkspaceEdit = new vscode.WorkspaceEdit();

	let workingRange;

	if (range && range.end.line >= range.start.line && range.start.character !== range.end.character) {
		// User has selected text
		// Use the range of text selection
		workingRange = range;
	} else {
		// User has not selected text
		// Compute range to be entire line
		const line = document.lineAt(range.start.line);
		const start = new vscode.Position(line.lineNumber, 0)
		const end = new vscode.Position(line.lineNumber, line.text.length)
		workingRange = new vscode.Range(start, end);
	}


	// get new string
	let oldText = document.getText(workingRange);
	console.log('text: ', oldText);

	console.log('generating new string...');
	let newText = oldText.replace(/(console.log.+)(\)).*/g, (match, p1, p2) => {
		return `${p1}, '${generateString()}'${p2}`;
	});

	console.log('new text: ', newText);

	fpWorkspaceEdit.replace(document.uri, workingRange, newText);

	return fpWorkspaceEdit
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "console-log-fingerprinter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('console-log-fingerprinter.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Console.log Fingerprinter from Paradime Labs!');
	});

	// register code action	
	let fingerprintConsoleLog = vscode.commands.registerCommand('console-log-fingerprinter.fingerprintConsoleLogs', () => {

		// execute command
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document
			const selection = editor.selection
			const selectedRange = new vscode.Range(selection.start, selection.end);

			const workspaceEdit = fingerPrintWorkspaceEdit(document, selectedRange)
			vscode.workspace.applyEdit(workspaceEdit);
		}
	});

	// register code action
	let supportedLangs: vscode.DocumentSelector = [
		{ "language": "javascript", "scheme": "file" },
		{ "language": "typescript", "scheme": "file" },
		{ "language": "javascriptreact", "scheme": "file" },
		{ "language": "typescriptreact", "scheme": "file" },
		{ "language": "svelte", "scheme": "file" }
	];

	let fpActionProvider: vscode.CodeActionProvider = {
		provideCodeActions(document, range, context) {
			console.log('provide code actions');
			let fpCodeAction = new vscode.CodeAction('Fingerprint console.log');

			const fpWorkspaceEdit = fingerPrintWorkspaceEdit(document, range)

			fpCodeAction.edit = fpWorkspaceEdit;

			return [fpCodeAction];

		}
	};

	vscode.languages.registerCodeActionsProvider(supportedLangs, fpActionProvider);



	context.subscriptions.push(disposable);
	context.subscriptions.push(fingerprintConsoleLog);
}

// This method is called when your extension is deactivated
export function deactivate() { }
