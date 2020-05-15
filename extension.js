// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const convert = require('./utils');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

const saveFileDialog = () => {
	return new Promise((resolve) => {
		const options = {
			canSelectMany: false,
			openLabel: 'Open',
			filters: {
				'Excel files': ['xlsx']
			}
		};
		vscode.window.showSaveDialog(options).then(fileInfos => {
			resolve(fileInfos);
		});
	});
}
const loadFileDialog = () => {
	return new Promise((resolve) => {
		const options = {
			canSelectMany: false,
			openLabel: 'Open',
			filters: {
				'JSon files': ['json']
			}
		};

		vscode.window.showOpenDialog(options).then(fileUri => {
			if (fileUri && fileUri[0]) {
				resolve(fileUri[0]);
			}
			else {
				resolve();
			}
		});
	})
}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "json-to-excel" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('json-to-excel.convert', async () => {

		const { fsPath: srcFileName } = await loadFileDialog();
		const { fsPath: dstFileName } = await saveFileDialog();
		//console.log({ srcFileName, dstFileName });
		// The code you place here will be executed every time your command is executed
		vscode.window.withProgress({
			//location: vscode.ProgressLocation.Notification,
			location: vscode.ProgressLocation.Window,
			cancellable: false,
			title: 'Converting...'
		}, async (progress) => {

			progress.report({ increment: 0 });

			const { error = false } = await convert({
				srcFileName,
				dstFileName,
				progress: (value, message) => {
					progress.report({ message/*, increment: value % 100 */ })
				}
			});
			if (error) {
				vscode.window.showErrorMessage(error);
			}
			else {
				vscode.window.showInformationMessage('Convert completed!');
			}

			progress.report({ increment: 100 });
		});


		// Display a message box to the user

	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
