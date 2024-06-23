/* eslint-disable @typescript-eslint/explicit-function-return-type */
import os from 'os';
import fs from 'fs';

const getRelativePathway = () => {
    const homeDir = os.homedir();
    const relativePathway = homeDir + '/Documents/generic-terminal/assets/';
    return relativePathway;
}

export const saveConfigFile = async (relativeFilePathUrl: string, fileName: string, data: string) => {
    try {
        fs.writeFileSync(getRelativePathway() + relativeFilePathUrl + fileName, data);
    } catch (e) {
        fs.mkdirSync(getRelativePathway(), { recursive: true });
        fs.mkdirSync(getRelativePathway() + relativeFilePathUrl, { recursive: true });
        fs.writeFileSync(getRelativePathway() + relativeFilePathUrl + fileName, data);
    }

}

export const loadConfigFile = async (relativeFilePathUrl: string, fileName: string, defaultState: unknown) => {
    try {
        const data = fs.readFileSync(getRelativePathway() + relativeFilePathUrl + fileName, 'utf8');
        if (data) {
            return data;
        }
        else {
            fs.mkdirSync(getRelativePathway(), { recursive: true });
            fs.mkdirSync(getRelativePathway() + relativeFilePathUrl, { recursive: true });
            const fileData = JSON.stringify(defaultState);
            fs.writeFileSync(getRelativePathway() + relativeFilePathUrl + fileName, fileData);
            return fileData;
        }
    } catch (e) {
        fs.mkdirSync(getRelativePathway(), { recursive: true });
        fs.mkdirSync(getRelativePathway() + relativeFilePathUrl, { recursive: true });
        const fileData = JSON.stringify(defaultState);
        fs.writeFileSync(getRelativePathway() + relativeFilePathUrl + fileName, fileData);
        return fileData;
    }
}

export const loadConfigDirectory = async (relativeFilepathUrl: string) => {
    try {
        const files = fs.readdirSync(getRelativePathway() + relativeFilepathUrl);
        if (files.length > 0) {
            const textValues = files.map((each) => {
                return fs.readFileSync(getRelativePathway() + relativeFilepathUrl + "/" + each, 'utf-8')
            });
            return textValues;
        }
        else {
            console.log("No files found");
            fs.mkdirSync(getRelativePathway(), { recursive: true });
            fs.mkdirSync(getRelativePathway() + relativeFilepathUrl, { recursive: true });
            return []
        }
    }
    catch (e) {
        console.log("Error: ", e);
        fs.mkdirSync(getRelativePathway(), { recursive: true });
        fs.mkdirSync(getRelativePathway() + relativeFilepathUrl, { recursive: true });
        return []
    }
}