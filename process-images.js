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
                    readline.question('请输入图片前缀名称 (例如 Blog): ', (prefix) => {
                        if (!prefix) {
                            prefix = 'site';
                        }
                        
                        console.log(`使用前缀: ${prefix}`);
                        
                        // 开始处理
                        processImages(selectedOption.path, prefix).then(() => {
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

// 主处理函数
async function processImages(targetDir, prefix) {
    try {
        console.log(`处理目录: ${targetDir}`);
        
        // 找到已存在的最大编号
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
        
        let currentNum = maxNum + 1;
        console.log(`从编号 ${currentNum} 开始`);
        
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
                
                try {
                    execSync(`ffmpeg -i "${fullPath}" -q:v 2 "${newFullPath}"`, {
                        stdio: 'ignore'
                    });
                    
                    // 转换成功后删除原文件
                    fs.unlinkSync(fullPath);
                    console.log(`已删除原文件: ${file}`);
                } catch (err) {
                    console.error(`转换失败: ${file}`, err.message);
                }
            }
        }
        
        // 重新读取文件列表（因为可能有新转换的文件）
        const updatedFiles = fs.readdirSync(targetDir);
        
        // 2. 压缩大于30KB的图片
        console.log('=== 正在压缩大于30KB的图片 ===');
        for (const file of updatedFiles) {
            const ext = path.extname(file).toLowerCase();
            const fullPath = path.join(targetDir, file);
            
            // 检查是否为文件
            if (!fs.statSync(fullPath).isFile()) continue;
            
            if (['.jpg', '.jpeg'].includes(ext)) {
                const fileSize = fs.statSync(fullPath).size;
                
                if (fileSize > 30720) { // 30KB
                    console.log(`压缩: ${file} (大小: ${Math.round(fileSize/1024)} KB)`);
                    
                    // 逐步降低质量直到小于30KB
                    let quality = 3;
                    const tempFile = fullPath + '.temp.jpg';
                    
                    while (fileSize > 30720 && quality <= 31) {
                        try {
                            execSync(`ffmpeg -i "${fullPath}" -q:v ${quality} "${tempFile}" -y`, {
                                stdio: 'ignore'
                            });
                            
                            const tempFileSize = fs.statSync(tempFile).size;
                            if (tempFileSize <= 30720) {
                                fs.renameSync(tempFile, fullPath);
                                console.log(`压缩完成: ${file} (新大小: ${Math.round(tempFileSize/1024)} KB)`);
                                break;
                            }
                            
                            quality += 2;
                        } catch (err) {
                            console.error(`压缩失败: ${file}`, err.message);
                            break;
                        }
                    }
                    
                    // 清理临时文件
                    if (fs.existsSync(tempFile)) {
                        fs.unlinkSync(tempFile);
                    }
                }
            }
        }
        
        // 3. 重命名所有JPG图片
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
        
    } catch (error) {
        throw new Error(`处理图片时出错: ${error.message}`);
    }
}

// 启动主程序
main();