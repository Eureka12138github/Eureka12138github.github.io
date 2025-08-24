// process-images.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 使用相对路径配置
const BASE_DIR = process.cwd(); // 当前工作目录
const IMG_DIR = path.join(BASE_DIR, 'static', 'img');

console.log('=== 图片处理脚本 ===');

// 检查基础目录是否存在
if (!fs.existsSync(IMG_DIR)) {
    console.log(`基础图片目录不存在: ${IMG_DIR}`);
    process.exit(1);
}

// 获取用户输入
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// 获取本地时间格式
function getLocalTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 获取本地时间戳用于文件名（避免特殊字符）
function getLocalTimestampForFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

// 日志记录函数
function logToFile(message, logFile = null) {
    if (logFile) {
        const timestamp = getLocalTimestamp();
        fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
    }
}

// 主函数
async function main() {
    try {
        // 查找所有子目录
        const subDirs = getSubDirectories(IMG_DIR);
        const imageFiles = getImageFiles(IMG_DIR);
        
        // 构建选项列表
        const options = [];
        if (imageFiles.length > 0) {
            options.push({
                name: `处理根目录图片 (${imageFiles.length} 个文件)`,
                path: IMG_DIR
            });
        }
        
        subDirs.forEach(dir => {
            const dirPath = path.join(IMG_DIR, dir);
            const files = getImageFiles(dirPath);
            if (files.length > 0) {
                options.push({
                    name: `处理 ~/${dir} 目录图片 (${files.length} 个文件)`,
                    path: dirPath
                });
            }
        });
        
        // 如果没有找到任何图片文件
        if (options.length === 0) {
            console.log('未找到任何包含图片的目录');
            readline.close();
            return;
        }
        
        // 显示选项让用户选择
        console.log('请选择要处理的图片目录:');
        options.forEach((option, index) => {
            console.log(`${index + 1}. ${option.name}`);
        });
        
        // 获取用户选择
        readline.question('\n请输入选项编号: ', (choice) => {
            const selectedIndex = parseInt(choice) - 1;
            
            if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= options.length) {
                console.log('无效的选择');
                readline.close();
                return;
            }
            
            const selectedOption = options[selectedIndex];
            console.log(`\n即将处理: ${selectedOption.name}`);
            
            // 获取前缀
            readline.question('请输入图片前缀名称 (例如 Blog)，直接回车表示只压缩不重命名: ', (prefix) => {
                let renameEnabled = true;
                let actualPrefix = prefix;
                
                if (!prefix) {
                    renameEnabled = false;
                    actualPrefix = 'temp'; // 临时前缀，不会实际使用
                    console.log('只进行图片压缩，不重命名文件');
                } else {
                    console.log(`使用前缀: ${actualPrefix}`);
                }
                
                // 询问日志文件位置
                readline.question('是否生成处理日志文件？(Y/N): ', (logChoice) => {
                    const logEnabled = logChoice.toLowerCase().trim() === 'y' || logChoice.toLowerCase().trim() === 'yes';
                    let logFile = null;
                    
                    if (logEnabled) {
                        readline.question('请输入日志文件保存路径（直接回车使用默认路径 logs/）: ', (logPath) => {
                            let logDir = logPath.trim();
                            if (!logDir) {
                                logDir = path.join(process.cwd(), 'logs');
                            }
                            
                            // 确保日志目录存在
                            if (!fs.existsSync(logDir)) {
                                fs.mkdirSync(logDir, { recursive: true });
                            }
                            
                            // 使用本地时间生成文件名
                            const timestamp = getLocalTimestampForFilename();
                            logFile = path.join(logDir, `image-processing-${timestamp}.log`);
                            console.log(`日志文件将保存到: ${logFile}`);
                            logToFile(`开始处理目录: ${selectedOption.path}`, logFile);
                            
                            // 确认处理
                            readline.question('确认开始处理吗？(Y/N): ', (confirm) => {
                                const answer = confirm.toLowerCase().trim();
                                
                                if (answer === 'y' || answer === 'yes') {
                                    // 记录开始时间
                                    const startTime = Date.now();
                                    
                                    // 记录处理前的文件夹大小
                                    const beforeStats = getDirectoryStats(selectedOption.path);
                                    
                                    // 开始处理
                                    processImages(selectedOption.path, actualPrefix, renameEnabled, logFile).then(() => {
                                        // 记录处理后的文件夹大小
                                        const afterStats = getDirectoryStats(selectedOption.path);
                                        
                                        // 记录结束时间
                                        const endTime = Date.now();
                                        const processingTime = endTime - startTime;
                                        
                                        // 显示处理总结
                                        showProcessingSummary(beforeStats, afterStats, processingTime, logFile);
                                        
                                        if (logFile) {
                                            logToFile(`处理完成，总耗时: ${formatTime(processingTime)}`, logFile);
                                        }
                                        
                                        console.log('=== 处理完成 ===');
                                        readline.close();
                                    }).catch(err => {
                                        console.error('处理过程中出错:', err.message);
                                        if (logFile) {
                                            logToFile(`处理出错: ${err.message}`, logFile);
                                        }
                                        readline.close();
                                    });
                                } else {
                                    console.log('操作已取消');
                                    if (logFile) {
                                        logToFile('操作已取消', logFile);
                                    }
                                    readline.close();
                                }
                            });
                        });
                    } else {
                        // 不生成日志文件，直接确认处理
                        readline.question('确认开始处理吗？(Y/N): ', (confirm) => {
                            const answer = confirm.toLowerCase().trim();
                            
                            if (answer === 'y' || answer === 'yes') {
                                // 记录开始时间
                                const startTime = Date.now();
                                
                                // 记录处理前的文件夹大小
                                const beforeStats = getDirectoryStats(selectedOption.path);
                                
                                // 开始处理
                                processImages(selectedOption.path, actualPrefix, renameEnabled, null).then(() => {
                                    // 记录处理后的文件夹大小
                                    const afterStats = getDirectoryStats(selectedOption.path);
                                    
                                    // 记录结束时间
                                    const endTime = Date.now();
                                    const processingTime = endTime - startTime;
                                    
                                    // 显示处理总结
                                    showProcessingSummary(beforeStats, afterStats, processingTime, null);
                                    
                                    console.log('=== 处理完成 ===');
                                    readline.close();
                                }).catch(err => {
                                    console.error('处理过程中出错:', err.message);
                                    readline.close();
                                });
                            } else {
                                console.log('操作已取消');
                                readline.close();
                            }
                        });
                    }
                });
            });
        });
        
    } catch (error) {
        console.error('脚本执行出错:', error.message);
        readline.close();
    }
}

// 获取子目录列表
function getSubDirectories(dirPath) {
    try {
        return fs.readdirSync(dirPath).filter(file => {
            const fullPath = path.join(dirPath, file);
            return fs.statSync(fullPath).isDirectory();
        });
    } catch (error) {
        return [];
    }
}

// 获取图片文件列表
function getImageFiles(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) return [];
        
        return fs.readdirSync(dirPath).filter(file => {
            const fullPath = path.join(dirPath, file);
            if (!fs.statSync(fullPath).isFile()) return false;
            
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
        });
    } catch (error) {
        return [];
    }
}

// 获取目录统计信息
function getDirectoryStats(dirPath) {
    try {
        const files = fs.readdirSync(dirPath);
        let totalSize = 0;
        let imageCount = 0;
        
        files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isFile()) {
                const ext = path.extname(file).toLowerCase();
                if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
                    totalSize += fs.statSync(fullPath).size;
                    imageCount++;
                }
            }
        });
        
        return {
            totalSize: totalSize,
            imageCount: imageCount
        };
    } catch (error) {
        return {
            totalSize: 0,
            imageCount: 0
        };
    }
}

// 显示处理总结
function showProcessingSummary(beforeStats, afterStats, processingTime, logFile = null) {
    console.log('\n=== 处理总结 ===');
    if (logFile) {
        logToFile('\n=== 处理总结 ===', logFile);
    }
    
    console.log(`处理图片数量: ${beforeStats.imageCount} 张`);
    console.log(`处理前文件夹大小: ${formatFileSize(beforeStats.totalSize)}`);
    console.log(`处理后文件夹大小: ${formatFileSize(afterStats.totalSize)}`);
    console.log(`处理总耗时: ${formatTime(processingTime)}`);
    
    if (logFile) {
        logToFile(`处理图片数量: ${beforeStats.imageCount} 张`, logFile);
        logToFile(`处理前文件夹大小: ${formatFileSize(beforeStats.totalSize)}`, logFile);
        logToFile(`处理后文件夹大小: ${formatFileSize(afterStats.totalSize)}`, logFile);
        logToFile(`处理总耗时: ${formatTime(processingTime)}`, logFile);
    }
    
    if (beforeStats.totalSize > 0) {
        const compressionRatio = ((beforeStats.totalSize - afterStats.totalSize) / beforeStats.totalSize * 100);
        console.log(`总体压缩率: ${compressionRatio.toFixed(1)}%`);
        if (logFile) {
            logToFile(`总体压缩率: ${compressionRatio.toFixed(1)}%`, logFile);
        }
        
        // 添加压缩率说明
        let compressionMessage = '';
        if (compressionRatio < 10) {
            compressionMessage = '提示: 压缩率较低可能是因为图片已经过压缩或图片本身质量较高';
        } else if (compressionRatio < 30) {
            compressionMessage = '提示: 压缩率适中，图片质量与文件大小达到了较好平衡';
        } else {
            compressionMessage = '提示: 压缩效果显著，有效减小了文件大小';
        }
        
        console.log(compressionMessage);
        if (logFile) {
            logToFile(compressionMessage, logFile);
        }
    }
}

// 格式化文件大小显示
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}

// 格式化时间显示
function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
        return `${minutes}分${remainingSeconds}秒`;
    } else {
        return `${seconds}秒`;
    }
}

// 主处理函数
async function processImages(targetDir, prefix, renameEnabled = true, logFile = null) {
    try {
        console.log(`处理目录: ${targetDir}`);
        if (logFile) {
            logToFile(`开始处理目录: ${targetDir}`, logFile);
        }
        
        // 找到已存在的最大编号（仅在需要重命名时）
        let currentNum = 1;
        if (renameEnabled) {
            let maxNum = 0;
            const existingFiles = fs.readdirSync(targetDir);
            existingFiles.forEach(file => {
                const match = file.match(new RegExp(`^${prefix}(\\d+)\\.(jpg|jpeg)$`, 'i'));
                if (match) {
                    const num = parseInt(match[1]);
                    if (num > maxNum) {
                        maxNum = num;
                    }
                }
            });
            currentNum = maxNum + 1;
        }
        
        // 获取所有文件
        const files = fs.readdirSync(targetDir);
        
        // 1. 转换非JPG格式的图片
        let convertedCount = 0;
        const startTimeConvert = Date.now();
        
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            const fullPath = path.join(targetDir, file);
            
            // 检查是否为文件
            if (!fs.statSync(fullPath).isFile()) continue;
            
            if (['.png', '.gif', '.bmp', '.webp'].includes(ext)) {
                const newName = path.basename(file, ext) + '.jpg';
                const newFullPath = path.join(targetDir, newName);
                
                let conversionSuccess = false;
                let errorMessage = '';
                
                try {
                    execSync(`ffmpeg -i "${fullPath}" -q:v 2 "${newFullPath}" -y`, {
                        stdio: ['pipe', 'pipe', 'pipe'] // 捕获所有输出但不显示
                    });
                    conversionSuccess = true;
                } catch (err) {
                    // ffmpeg 可能因为警告信息返回非零退出码，但我们仍需检查文件是否生成
                    conversionSuccess = fs.existsSync(newFullPath) && fs.statSync(newFullPath).size > 0;
                    errorMessage = err.message;
                }
                
                // 检查转换结果
                if (conversionSuccess && fs.existsSync(newFullPath) && fs.statSync(newFullPath).size > 0) {
                    try {
                        // 转换成功后删除原文件
                        fs.unlinkSync(fullPath);
                        convertedCount++;
                        if (logFile) {
                            logToFile(`转换成功: ${file} -> ${newName}`, logFile);
                        }
                    } catch (deleteErr) {
                        console.error(`文件转换成功但删除原文件失败: ${file}`);
                        if (logFile) {
                            logToFile(`文件转换成功但删除原文件失败: ${file} - ${deleteErr.message}`, logFile);
                        }
                    }
                } else {
                    console.error(`转换失败: ${file}`);
                    if (logFile) {
                        logToFile(`转换失败: ${file} - ${errorMessage}`, logFile);
                    }
                    // 如果生成了空文件，删除它
                    if (fs.existsSync(newFullPath) && fs.statSync(newFullPath).size === 0) {
                        fs.unlinkSync(newFullPath);
                    }
                }
            }
        }
        
        const endTimeConvert = Date.now();
        const convertTime = endTimeConvert - startTimeConvert;
        
        if (convertedCount > 0) {
            console.log(`转换完成: ${convertedCount} 个文件已转换为JPG格式 (耗时: ${formatTime(convertTime)})`);
            if (logFile) {
                logToFile(`转换完成: ${convertedCount} 个文件已转换为JPG格式 (耗时: ${formatTime(convertTime)})`, logFile);
            }
        }
        
        // 重新读取文件列表（因为可能有新转换的文件）
        const updatedFiles = fs.readdirSync(targetDir);
        
        // 2. 尽可能压缩图片
        let compressedCount = 0;
        let totalCompressionRatio = 0;
        let processedFilesCount = 0;
        const startTimeCompress = Date.now();
        
        for (const file of updatedFiles) {
            const ext = path.extname(file).toLowerCase();
            const fullPath = path.join(targetDir, file);
            
            // 检查是否为文件
            if (!fs.statSync(fullPath).isFile()) continue;
            
            // 跳过已经按命名规则命名的文件（避免重复处理）
            const isAlreadyNamed = new RegExp(`^${prefix}\\d+\\.(jpg|jpeg)$`, 'i').test(file);
            if (isAlreadyNamed && renameEnabled) {
                continue;
            }
            
            if (['.jpg', '.jpeg'].includes(ext)) {
                const originalFileSize = fs.statSync(fullPath).size;
                
                // 对于已经很小的文件，跳过压缩
                if (originalFileSize < 10240) { // < 10KB
                    continue;
                }
                
                // 尽可能压缩图片 - 从较高质量开始逐步降低
                let quality = 20; // 起始质量
                const tempFile = fullPath + '.temp.jpg';
                let bestFileSize = originalFileSize;
                let bestQuality = 0; // 0表示未压缩
                let attempts = 0;
                const maxAttempts = 8; // 限制尝试次数
                
                // 尝试不同的质量设置
                while (quality <= 31 && attempts < maxAttempts) {
                    try {
                        execSync(`ffmpeg -i "${fullPath}" -q:v ${quality} "${tempFile}" -y`, {
                            stdio: ['pipe', 'pipe', 'pipe'] // 捕获所有输出但不显示
                        });
                        
                        const tempFileSize = fs.statSync(tempFile).size;
                        
                        // 如果新文件更小，保存这个结果
                        if (tempFileSize < bestFileSize) {
                            bestFileSize = tempFileSize;
                            bestQuality = quality;
                        }
                        
                        quality += 3; // 增加质量值（降低质量）
                        attempts++;
                    } catch (err) {
                        if (logFile) {
                            logToFile(`压缩尝试失败 (质量=${quality}): ${file} - ${err.message}`, logFile);
                        }
                        break;
                    }
                }
                
                // 判断压缩结果
                const sizeDifference = originalFileSize - bestFileSize;
                const compressionRatio = (sizeDifference / originalFileSize * 100);
                
                // 如果有明显压缩效果（至少压缩1%或1KB）
                if (bestQuality > 0 && (compressionRatio >= 1.0 || sizeDifference >= 1024)) {
                    // 应用最佳压缩结果
                    if (fs.existsSync(tempFile)) {
                        fs.renameSync(tempFile, fullPath);
                        compressedCount++;
                        totalCompressionRatio += compressionRatio;
                        processedFilesCount++;
                        if (logFile) {
                            logToFile(`压缩成功: ${file} (${formatFileSize(originalFileSize)} -> ${formatFileSize(bestFileSize)}, 压缩率: ${compressionRatio.toFixed(1)}%)`, logFile);
                        }
                    }
                } else {
                    // 没有明显压缩效果
                    if (fs.existsSync(tempFile)) {
                        fs.unlinkSync(tempFile);
                    }
                    if (logFile) {
                        logToFile(`跳过压缩: ${file} (无法有效压缩)`, logFile);
                    }
                }
            }
        }
        
        const endTimeCompress = Date.now();
        const compressTime = endTimeCompress - startTimeCompress;
        
        if (compressedCount > 0) {
            const avgCompressionRatio = totalCompressionRatio / processedFilesCount;
            console.log(`压缩完成: ${compressedCount} 个文件被压缩，平均压缩率: ${avgCompressionRatio.toFixed(1)}% (耗时: ${formatTime(compressTime)})`);
            if (logFile) {
                logToFile(`压缩完成: ${compressedCount} 个文件被压缩，平均压缩率: ${avgCompressionRatio.toFixed(1)}% (耗时: ${formatTime(compressTime)})`, logFile);
            }
        }
        
        // 3. 重命名所有JPG图片（仅在启用重命名时）
        if (renameEnabled) {
            let renamedCount = 0;
            const jpgFiles = fs.readdirSync(targetDir).filter(file => {
                const ext = path.extname(file).toLowerCase();
                const fullPath = path.join(targetDir, file);
                return fs.statSync(fullPath).isFile() && ['.jpg', '.jpeg'].includes(ext);
            }).sort();
            
            for (const file of jpgFiles) {
                const ext = path.extname(file);
                const fullPath = path.join(targetDir, file);
                
                // 检查是否已经符合命名规则
                const isAlreadyNamed = new RegExp(`^${prefix}\\d+\\.(jpg|jpeg)$`, 'i').test(file);
                
                if (!isAlreadyNamed) {
                    const newName = `${prefix}${currentNum}${ext}`;
                    const newFullPath = path.join(targetDir, newName);
                    
                    try {
                        fs.renameSync(fullPath, newFullPath);
                        currentNum++;
                        renamedCount++;
                        if (logFile) {
                            logToFile(`重命名: ${file} -> ${newName}`, logFile);
                        }
                    } catch (renameErr) {
                        console.error(`重命名失败: ${file} -> ${newName}`);
                        if (logFile) {
                            logToFile(`重命名失败: ${file} -> ${newName} - ${renameErr.message}`, logFile);
                        }
                    }
                }
            }
            
            if (renamedCount > 0) {
                console.log(`重命名完成: ${renamedCount} 个文件已重命名`);
                if (logFile) {
                    logToFile(`重命名完成: ${renamedCount} 个文件已重命名`, logFile);
                }
            }
        }
        
    } catch (error) {
        if (logFile) {
            logToFile(`处理过程中发生错误: ${error.message}`, logFile);
        }
        throw new Error(`处理图片时出错: ${error.message}`);
    }
}

// 启动主程序
main();