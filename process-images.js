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
            
            // 确认处理
            readline.question('确认继续吗？(Y/N): ', (confirm) => {
                const answer = confirm.toLowerCase().trim();
                
                if (answer === 'y' || answer === 'yes') {
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
                        
                        // 开始处理
                        processImages(selectedOption.path, actualPrefix, renameEnabled).then(() => {
                            console.log('=== 处理完成 ===');
                            readline.close();
                        }).catch(err => {
                            console.error('处理过程中出错:', err);
                            readline.close();
                        });
                    });
                } else {
                    console.log('操作已取消');
                    readline.close();
                }
            });
        });
        
    } catch (error) {
        console.error('脚本执行出错:', error);
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
        console.error('读取目录失败:', error);
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

// 估算JPEG质量等级（简单估算）
function estimateJpegQuality(filePath) {
    try {
        const fileSize = fs.statSync(filePath).size;
        
        // 基于文件大小的粗略质量估算（假设1920x1080图片）
        if (fileSize > 500000) return 'high';     // > 500KB 高质量
        if (fileSize > 100000) return 'medium';   // 100-500KB 中等质量
        return 'low';                             // < 100KB 低质量
    } catch (error) {
        return 'unknown';
    }
}

// 主处理函数
async function processImages(targetDir, prefix, renameEnabled = true) {
    try {
        console.log(`处理目录: ${targetDir}`);
        
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
            console.log(`从编号 ${currentNum} 开始`);
        }
        
        // 获取所有文件
        const files = fs.readdirSync(targetDir);
        
        // 1. 转换非JPG格式的图片
        console.log('=== 正在转换非JPG格式图片 ===');
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            const fullPath = path.join(targetDir, file);
            
            // 检查是否为文件
            if (!fs.statSync(fullPath).isFile()) continue;
            
            if (['.png', '.gif', '.bmp', '.webp'].includes(ext)) {
                const newName = path.basename(file, ext) + '.jpg';
                const newFullPath = path.join(targetDir, newName);
                
                console.log(`转换: ${file} -> ${newName}`);
                
                let conversionSuccess = false;
                
                try {
                    execSync(`ffmpeg -i "${fullPath}" -q:v 2 "${newFullPath}" -y`, {
                        stdio: 'pipe'
                    });
                    conversionSuccess = true;
                } catch (err) {
                    // ffmpeg 可能因为警告信息返回非零退出码，但我们仍需检查文件是否生成
                    conversionSuccess = fs.existsSync(newFullPath) && fs.statSync(newFullPath).size > 0;
                }
                
                // 检查转换结果
                if (conversionSuccess && fs.existsSync(newFullPath) && fs.statSync(newFullPath).size > 0) {
                    try {
                        // 转换成功后删除原文件
                        fs.unlinkSync(fullPath);
                        console.log(`转换成功: ${file} -> ${newName}`);
                        console.log(`已删除原文件: ${file}`);
                    } catch (deleteErr) {
                        console.error(`文件转换成功但删除原文件失败: ${file}`, deleteErr.message);
                    }
                } else {
                    console.error(`转换失败: ${file} (目标文件未生成或为空)`);
                    // 如果生成了空文件，删除它
                    if (fs.existsSync(newFullPath) && fs.statSync(newFullPath).size === 0) {
                        fs.unlinkSync(newFullPath);
                    }
                }
            }
        }
        
        // 重新读取文件列表（因为可能有新转换的文件）
        const updatedFiles = fs.readdirSync(targetDir);
        
        // 2. 尽可能压缩图片
        console.log('=== 正在尽可能压缩图片 ===');
        for (const file of updatedFiles) {
            const ext = path.extname(file).toLowerCase();
            const fullPath = path.join(targetDir, file);
            
            // 检查是否为文件
            if (!fs.statSync(fullPath).isFile()) continue;
            
            // 跳过已经按命名规则命名的文件（避免重复处理）
            const isAlreadyNamed = new RegExp(`^${prefix}\\d+\\.(jpg|jpeg)$`, 'i').test(file);
            if (isAlreadyNamed && renameEnabled) {
                console.log(`跳过已处理文件: ${file}`);
                continue;
            }
            
            if (['.jpg', '.jpeg'].includes(ext)) {
                const originalFileSize = fs.statSync(fullPath).size;
                
                // 对于已经很小的文件，跳过压缩
                if (originalFileSize < 10240) { // < 10KB
                    console.log(`跳过压缩: ${file} (文件已很小: ${Math.round(originalFileSize/1024)} KB)`);
                    continue;
                }
                
                const qualityEstimate = estimateJpegQuality(fullPath);
                console.log(`压缩: ${file} (原大小: ${Math.round(originalFileSize/1024)} KB, 质量评估: ${qualityEstimate})`);
                
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
                            stdio: 'ignore'
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
                        console.error(`压缩尝试失败 (质量=${quality}): ${file}`, err.message);
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
                        console.log(`压缩完成: ${file} (原大小: ${Math.round(originalFileSize/1024)} KB -> 压缩后大小: ${Math.round(bestFileSize/1024)} KB, 压缩率: ${compressionRatio.toFixed(1)}%)`);
                    }
                } else {
                    // 没有明显压缩效果
                    if (fs.existsSync(tempFile)) {
                        fs.unlinkSync(tempFile);
                    }
                    console.log(`压缩完成: ${file} (原大小: ${Math.round(originalFileSize/1024)} KB -> 无法进一步压缩)`);
                }
            }
        }
        
        // 3. 重命名所有JPG图片（仅在启用重命名时）
        if (renameEnabled) {
            console.log('=== 正在重命名图片 ===');
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
                
                if (isAlreadyNamed) {
                    console.log(`跳过已命名文件: ${file}`);
                } else {
                    const newName = `${prefix}${currentNum}${ext}`;
                    const newFullPath = path.join(targetDir, newName);
                    
                    fs.renameSync(fullPath, newFullPath);
                    console.log(`重命名: ${file} -> ${newName}`);
                    currentNum++;
                }
            }
        } else {
            console.log('=== 跳过重命名步骤 ===');
        }
        
    } catch (error) {
        throw new Error(`处理图片时出错: ${error.message}`);
    }
}

// 启动主程序
main();