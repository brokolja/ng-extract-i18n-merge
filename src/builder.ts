import {BuilderContext, BuilderOutput, createBuilder} from '@angular-devkit/architect';
import {basename, dirname, join, JsonObject, normalize} from '@angular-devkit/core';
import {merge} from 'xliff-simple-merge/dist/src/merge';
import {promises as fs} from 'fs';
import {xmlNormalize} from 'xml_normalize/dist/src/xmlNormalize';

export interface Options extends JsonObject {
    format: 'xlf' | 'xlif' | 'xliff' | 'xlf2' | 'xliff2' | null
    outputPath: string | null,
    sourceFile: string | null,
    targetFiles: string[],
    sourceLanguageTargetFile: string | null,
    removeIdsWithPrefix: string[] | null,
    fuzzyMatch: boolean,
    resetTranslationState: boolean,
    collapseWhitespace: boolean,
    includeContext: boolean,
    newTranslationTargetsBlank: boolean,
}

export default createBuilder(copyFileBuilder);

async function copyFileBuilder(options: Options, context: BuilderContext): Promise<BuilderOutput> {
    context.logger.info(`Running ng-extract-i18n-merge for project ${context.target?.project}`);

    console.debug = () => null; // prevent debug output from xml_normalize and xliff-simple-merge
    const extractI18nTarget = {target: 'extract-i18n', project: context.target?.project!};
    const extractI18nOptions = await context.getTargetOptions(extractI18nTarget);
    context.logger.debug(`options: ${JSON.stringify(options)}`);
    context.logger.debug(`extractI18nOptions: ${JSON.stringify(extractI18nOptions)}`);
    const outputPath = options.outputPath as string || extractI18nOptions.outputPath as string || '.';
    const format = options.format as string || extractI18nOptions.format as string || 'xlf';
    const isXliffV2 = format.includes('2');

    context.logger.info('running "extract-i18n" ...');
    const sourcePath = join(normalize(outputPath), options.sourceFile ?? 'messages.xlf');

    const extractI18nRun = await context.scheduleTarget(extractI18nTarget, {outputPath: dirname(sourcePath), outFile: basename(sourcePath), format, progress: false});
    const extractI18nResult = await extractI18nRun.result;
    if (!extractI18nResult.success) {
        return {success: false, error: `"extract-i18n" failed: ${extractI18nResult.error}`};
    }
    context.logger.info(`extracted translations successfully`);

    context.logger.info(`normalize ${sourcePath} ...`);
    const translationSourceFile = await fs.readFile(sourcePath, 'utf8');
    const removePaths = [
        ...(options.includeContext ? [] : [isXliffV2 ? '/xliff/file/unit/notes' : '/xliff/file/body/trans-unit/context-group']),
        ...(options.removeIdsWithPrefix ?? []).map(removePrefix => isXliffV2 ? `/xliff/file/unit[starts-with(@id,"${removePrefix}")]` : `/xliff/file/body/trans-unit[starts-with(@id,"${removePrefix}")]`)
    ];
    const normalizedTranslationSourceFile = xmlNormalize({
        in: translationSourceFile,
        normalizeWhitespace: true,
        sortPath: isXliffV2 ? '/xliff/file/unit/@id' : '/xliff/file/body/trans-unit/@id',
        removePath: removePaths
    });
    await fs.writeFile(sourcePath, normalizedTranslationSourceFile);

    for (const targetFile of options.targetFiles) {
        const targetPath = join(normalize(outputPath), targetFile);
        context.logger.info(`merge and normalize ${targetPath} ...`);
        const translationTargetFile = await fs.readFile(targetPath, 'utf8');
        const mergedTarget = merge(normalizedTranslationSourceFile, translationTargetFile, {...options, sourceLanguage: targetFile === options.sourceLanguageTargetFile});
        const normalizedTarget = xmlNormalize({
            in: mergedTarget,
            normalizeWhitespace: true,
            sortPath: isXliffV2 ? '/xliff/file/unit/@id' : '/xliff/file/body/trans-unit/@id',
            removePath: removePaths
        });
        await fs.writeFile(targetPath, normalizedTarget);
    }

    context.logger.info('finished i18n merging and normalizing');
    return {success: true};
}
