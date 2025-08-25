// deploy-site.js (修改版)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查当前目录是否匹配预期的站点
function checkSiteMatch(site) {
  try {
    // 获取当前目录的 git remote URL
    const remoteUrl = execSync('git remote get-url origin', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    
    // 定义每个站点期望的远程仓库 URL
    const expectedRemotes = {
      site1: 'git@github.com:Eureka12138github/Eureka12138github.github.io.git',
      site2: 'git@github.com:EurekaShadow/EurekaShadow.github.io.git' // 根据实际情况调整
    };
    
    const expectedRemote = expectedRemotes[site];
    if (expectedRemote && remoteUrl !== expectedRemote) {
      console.warn(`\n⚠️  警告: 当前目录的远程仓库与 ${site} 不匹配`);
      console.warn(`   当前远程: ${remoteUrl}`);
      console.warn(`   期望远程: ${expectedRemote}`);
      return false;
    }
    
    return true;
  } catch (error) {
    // 如果无法获取 git remote，跳过检查
    console.warn('⚠️  无法验证当前 git 远程仓库');
    return true;
  }
}

// 检查 docusaurus 配置中的组织和项目名
function checkDocusaurusConfig(site) {
  try {
    // 读取 docusaurus 配置
    const docusaurusConfigPath = path.join(process.cwd(), 'docusaurus.config.js');
    if (!fs.existsSync(docusaurusConfigPath)) {
      console.warn('⚠️  未找到 docusaurus.config.js 文件');
      return true;
    }
    
    // 简单检查配置内容
    const configContent = fs.readFileSync(docusaurusConfigPath, 'utf8');
    
    const expectedConfigs = {
      site1: {
        organizationName: 'Eureka12138github',
        projectName: 'Eureka12138github.github.io'
      },
      site2: {
        organizationName: 'EurekaShadow',
        projectName: 'EurekaShadow.github.io'
      }
    };
    
    const expectedConfig = expectedConfigs[site];
    if (expectedConfig) {
      const hasOrgName = configContent.includes(`organizationName: '${expectedConfig.organizationName}'`) ||
                        configContent.includes(`organizationName: "${expectedConfig.organizationName}"`);
      const hasProjectName = configContent.includes(`projectName: '${expectedConfig.projectName}'`) ||
                            configContent.includes(`projectName: "${expectedConfig.projectName}"`);
      
      if (!hasOrgName || !hasProjectName) {
        console.warn(`\n⚠️  警告: docusaurus.config.js 配置可能与 ${site} 不匹配`);
        console.warn(`   请检查 organizationName 和 projectName 配置`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.warn('⚠️  无法验证 docusaurus 配置');
    return true;
  }
}

function deploySite(site) {
  console.log(`=== 开始部署 ${site} ===`);
  
  // 执行检查
  const siteMatch = checkSiteMatch(site);
  const configMatch = checkDocusaurusConfig(site);
  
  // 如果检查失败，询问用户是否继续
  if (!siteMatch || !configMatch) {
    console.log(`\n🚨 检测到可能的配置不匹配！`);
    console.log(`当前正在尝试部署: ${site}`);
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('是否继续部署？(Y/N): ', (answer) => {
      rl.close();
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('部署已取消');
        process.exit(0);
      }
      proceedWithDeployment(site);
    });
  } else {
    proceedWithDeployment(site);
  }
}

function proceedWithDeployment(site) {
  try {
    // 1. 切换 SSH 配置 (修改这里：添加 ./scripts/ 路径)
    console.log('1. 切换 SSH 密钥配置...');
    execSync(`node ./scripts/ssh-config-manager.js switch ${site}`, { stdio: 'inherit' });
    
    // 2. 执行 Docusaurus 部署
    console.log('2. 执行 Docusaurus 部署...');
    execSync('npx docusaurus deploy', { stdio: 'inherit' });
    
    console.log(`\n🎉 ${site} 部署成功完成!`);
    console.log(`💡 提示: 当前 SSH 配置已更改为 ${site} 使用的密钥`);
    console.log(`   相关命令:`);
    console.log(`   node ./scripts/ssh-config-manager.js switch site1  # 切换到 site1`);
    console.log(`   node ./scripts/ssh-config-manager.js switch site2  # 切换到 site2`);
    console.log(`   site1: https://eureka12138github.github.io/`);
    console.log(`   site2: https://eurekashadow.github.io/`);
  } catch (error) {
    console.error(`\n❌ ${site} 部署失败:`, error.message);
    process.exit(1);
  }
}

const site = process.argv[2];
if (!site || !['site1', 'site2'].includes(site)) {
  console.error('用法: node deploy-site.js [site1|site2]');
  console.log('  site1: 部署 Eureka12138github 站点');
  console.log('  site2: 部署 EurekaShadow 站点');
  process.exit(1);
}

deploySite(site);