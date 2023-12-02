import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
let count = 0;
let hasConsoleLogs = false;
export function activate(context: vscode.ExtensionContext) {
	let disposableFolder = vscode.commands.registerCommand('del-console-folder', () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders) {
			// 获取第一个工作区的根路径
			const rootPath = workspaceFolders[0].uri.fsPath;
			// 拼接路径
			const srcPath = rootPath + '/src';
			deleteConsoleLogs(srcPath);
			context.subscriptions.push(disposableFolder);
			// vscode.window.showInformationMessage(`已删除 ${count} 个 console.log 语句`);
			const message = `已删除 ${count} 个 console.log 语句`;
				vscode.window.showInformationMessage(message, { modal: true });
			// 1秒后关闭弹窗
			setTimeout(() => {
				// @ts-ignore
				vscode.window.activeInformationMessage?.dispose();
			}, 1000);
			// 如果没有 console.log 语句，提示没有
			// 重置 count 和 hasConsoleLogs
			count = 0;
			hasConsoleLogs = false;
		} else {
			console.error('没有打开的工作区');
		}
	});

	let disposableFile = vscode.commands.registerCommand('del-console-file', () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders) {
			// 获取当前文件的路径
			const filePath = vscode.window.activeTextEditor?.document.uri.fsPath || '';
			if (filePath) {
				deleteConsoleLogsInFile(filePath);
				context.subscriptions.push(disposableFile);
				const message = `已删除 ${count} 个 console.log 语句`;
				vscode.window.showInformationMessage(message, { modal: true });
				// 1秒后关闭弹窗
				setTimeout(() => {
					// @ts-ignore
					vscode.window.activeInformationMessage?.dispose();
				}, 1000);
				// 重置 count 和 hasConsoleLogs
				count = 0;
				hasConsoleLogs = false;
			} else {
				vscode.window.showInformationMessage('没有文件被打开');
			}
		} else {
			console.error('没有打开的工作区');
		}
	});

}

function deleteConsoleLogs(directory: string) {
	const files = fs.readdirSync(directory);
	files.forEach((file) => {
		const filePath = path.join(directory, file);
		const stats = fs.statSync(filePath);
		if (stats.isDirectory()) {
			deleteConsoleLogs(filePath);
		} else if (stats.isFile()) {
			deleteConsoleLogsInFile(filePath);
		}
	});
}

function deleteConsoleLogsInFile(filePath: string) {
	let fileContent = fs.readFileSync(filePath, 'utf-8');
	const updatedContent = fileContent.replace(/console\.log\(.*?\);/g, '');
	count += (fileContent.match(/console\.log\(.*?\);/g) || []).length;
	if (fileContent !== updatedContent) {
		fs.writeFileSync(filePath, updatedContent, 'utf-8');
		hasConsoleLogs = true;
	}
}


export function deactivate() {
	// TODO: 释放资源和取消注册事件监听器等操作
}