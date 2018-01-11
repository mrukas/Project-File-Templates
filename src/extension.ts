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

    let disposable2 = vscode.commands.registerTextEditorCommand("extension.importTemplateToFile", (editor, edit, file) => {

        console.log("Das ist ein Test");
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
}

function startCreateFileFromTemplate(clickedFolder: string) {
    let workspaceFolder = getWorkSpaceFolder(clickedFolder);

    chooseTemplate(workspaceFolder.uri.path)
        .then(templatePath => {
            if (!templatePath) {
                return;
            }

            createFileFromTemplate(clickedFolder, templatePath)
        });
}

function chooseTemplate(workspaceFolder: string): Thenable<string> {
    let templates = getTemplateFiles(workspaceFolder);
    return vscode.window.showQuickPick(templates.map(x => x.name)).then(item => {
        if (!item) {
            return;
        }

        let selectedTemplate = templates.filter(x => x.name === item)[0];
        return selectedTemplate.path;
    });
}

function chooseFilename(templatePath: string): Thenable<string> {
    return vscode.window.showInputBox({ placeHolder: 'Please enter a filename' }).then(filename => {
        if (typeof (filename) === 'undefined') {
            return;
        }

        if (!filename) {
            vscode.window.showErrorMessage('Filename cannot bet empty.');
            return;
        }

        if (!path.extname(filename)) {
            filename = `${filename}${path.extname(templatePath)}`;
        }

        return filename;
    });
}

function createFileFromTemplate(targetfolder: string, templatePath: string) {
    chooseFilename(templatePath).then(filename => {
        if (!filename) {
            return;
        }

        var targetFile = path.join(targetfolder, filename);
        var templateString = loadTemplate(templatePath);

        var writer = fs.createWriteStream(targetFile);

        writer.on('finish', () => {
            vscode.window.showTextDocument(vscode.Uri.file(targetFile)).then(texteditor => {
                texteditor.insertSnippet(new vscode.SnippetString(templateString));
            });
        });

        writer.end();
    });
}

function loadTemplate(templatePath: string): string {
    return fs.readFileSync(templatePath, { encoding: 'utf8' });
}

function getWorkSpaceFolder(folder: string) {
    return vscode.workspace.getWorkspaceFolder(vscode.Uri.file(folder));
}

function getTemplateFiles(workspaceDir: string): { name: string, path: string }[] {
    let templateFolder = path.join(workspaceDir, '.vscode', 'templates');
    let templateFolderExists = fs.existsSync(templateFolder);

    let templates;

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