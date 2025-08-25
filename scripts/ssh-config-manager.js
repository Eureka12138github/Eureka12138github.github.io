// ssh-config-manager.js
const fs = require('fs');
const path = require('path');
const os = require('os');

// 使用真实的 SSH 配置路径
const sshConfigPath = path.join(os.homedir(), '.ssh', 'config');

// 为不同站点定义配置（只针对仓库1，即 Host github.com 部分）
const siteConfigs = {
  site1: {
    identityFile: '~/.ssh/id_E1H'      // 用于 Eureka12138github 账户
  },
  site2: {
    identityFile: '~/.ssh/id_ed25519'  // 用于 EurekaShadow 账户
  }
};

function updateSSHConfig(site) {
  const config = siteConfigs[site];
  if (!config) {
    throw new Error(`Unknown site: ${site}`);
  }

  // 读取当前配置
  let content = fs.readFileSync(sshConfigPath, 'utf8');
  
  // 只替换 Host github.com 部分中的 IdentityFile（即仓库1的部分）
  // 确保只匹配仓库1的配置，不匹配仓库2 (github.com_EurekaShadow)
  const githubSectionRegex = /(Host\s+github\.com\s+[^#]*?IdentityFile\s+)[^\r\n]+/;
  
  if (content.match(githubSectionRegex)) {
    content = content.replace(githubSectionRegex, `$1${config.identityFile}`);
    
    // 写回配置文件
    fs.writeFileSync(sshConfigPath, content);
    console.log(`✅ SSH config updated for ${site}`);
    console.log(`   IdentityFile changed to: ${config.identityFile}`);
  } else {
    // 如果上面的正则不工作，尝试更简单的匹配
    const simpleRegex = /(Host\s+github\.com[\s\S]*?IdentityFile\s+)[^\r\n]+/;
    if (content.match(simpleRegex)) {
      content = content.replace(simpleRegex, `$1${config.identityFile}`);
      fs.writeFileSync(sshConfigPath, content);
      console.log(`✅ SSH config updated for ${site}`);
      console.log(`   IdentityFile changed to: ${config.identityFile}`);
    } else {
      throw new Error('github.com section not found in SSH config');
    }
  }
}

const command = process.argv[2];
const site = process.argv[3];

try {
  switch (command) {
    case 'switch':
      if (!site) {
        console.error('Please specify a site (site1 or site2)');
        console.log('Usage: node ssh-config-manager.js switch site1|site2');
        process.exit(1);
      }
      updateSSHConfig(site);
      break;
    default:
      console.log('Usage: node ssh-config-manager.js switch site1|site2');
      console.log('  site1: Use ~/.ssh/id_E1H key (for Eureka12138github)');
      console.log('  site2: Use ~/.ssh/id_ed25519 key (for EurekaShadow)');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}