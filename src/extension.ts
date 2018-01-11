'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.createFileFromTemplateContextMenu', (folderName) => {
        if (!folderName) {
            vscode.window.showInformationMessage('Please select a folder!');
            return;
        }

        let clickedFolderPath = folderName.path;

        startCreateFileFromTemplate(clickedFolderPath)
    });

    context.subscriptions.push(disposable);
}

function startCreateFileFromTemplate(clickedFolder: string) {
    let workspaceFolder = getWorkSpaceFolder(clickedFolder);
    let templates = getTemplateFiles(workspaceFolder.uri.path);

    vscode.window.showQuickPick(templates.map(x => x.name)).then(item => {
        let selectedTemplate = templates.filter(x => x.name === item)[0];
        createFileFromTemplate(clickedFolder, selectedTemplate.path);
    });
}

function createFileFromTemplate(targetfolder: string, templatePath: string) {
    vscode.window.showInputBox({ placeHolder: 'Please enter a filename' }).then(filename => {
        if (!path.extname(filename)) {
            filename = `${filename}${path.extname(templatePath)}`;
        }

        var targetFile = path.join(targetfolder, filename);
        var templateString = fs.readFileSync(templatePath, { encoding: 'utf8' });
        var writer = fs.createWriteStream(targetFile);

        writer.on('finish', () => {
            vscode.window.showTextDocument(vscode.Uri.file(targetFile)).then(texteditor => {
                texteditor.insertSnippet(new vscode.SnippetString(templateString));
            });
        });

        writer.end();
    });
}

function getWorkSpaceFolder(folder: string) {
    return vscode.workspace.getWorkspaceFolder(vscode.Uri.file(folder));
}

function getTemplateFiles(workspaceDir: string): { name: string, path: string }[] {
    let templates;

    let templateFolder = path.join(workspaceDir, '.vscode', 'templates');
    let templateFolderExists = fs.existsSync(templateFolder);

    if (templateFolderExists) {
        templates = fs.readdirSync(templateFolder).map(file => ({ name: file, path: path.join(templateFolder, file) }));
    } else {
        templates = [];
    }

    return templates;
}

// this method is called when your extension is deactivated
export function deactivate() {
}