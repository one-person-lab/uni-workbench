import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useAuthorProfile } from '../hooks/useAssets';
import { createAuthorProfile } from '../assets/models';

export function AuthorProfilePage() {
  const { profile, saveProfile } = useAuthorProfile();
  const [name, setName] = useState(profile?.name || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [tagline, setTagline] = useState(profile?.tagline || '');
  const [expertise, setExpertise] = useState(profile?.expertise?.join(', ') || '');
  const [wechat, setWechat] = useState(profile?.socials?.wechat || '');
  const [email, setEmail] = useState(profile?.socials?.email || '');
  const [github, setGithub] = useState(profile?.socials?.github || '');
  const [website, setWebsite] = useState(profile?.socials?.website || '');

  const handleSave = () => {
    const authorProfile = createAuthorProfile({
      id: profile?.id,
      name,
      avatar,
      bio,
      tagline,
      expertise: expertise.split(',').map(t => t.trim()).filter(t => t),
      socials: {
        wechat,
        email,
        github,
        website,
      },
    });
    saveProfile(authorProfile);
  };

  return (
    <div className="author-profile">
      <PageHeader
        title="个人品牌"
        description="建立你的个人品牌，为商业化做准备"
      />

      <div className="editor-form">
        {/* 基本信息 */}
        <div className="form-section">
          <h3>基本信息</h3>
          <div className="form-group">
            <label>名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的名字或品牌名"
            />
          </div>

          <div className="form-group">
            <label>一句话介绍</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="例如：AI 编程专家，9年开发经验"
            />
          </div>

          <div className="form-group">
            <label>个人简介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="详细介绍你的专业背景和经验"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>头像 URL</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="你的头像图片链接"
            />
          </div>
        </div>

        {/* 专业领域 */}
        <div className="form-section">
          <h3>专业领域</h3>
          <div className="form-group">
            <label>擅长领域（用逗号分隔）</label>
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="例如：AI, 编程, 架构设计"
            />
          </div>
        </div>

        {/* 社交链接 */}
        <div className="form-section">
          <h3>社交链接</h3>
          <div className="form-group">
            <label>微信</label>
            <input
              type="text"
              value={wechat}
              onChange={(e) => setWechat(e.target.value)}
              placeholder="微信号"
            />
          </div>

          <div className="form-group">
            <label>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="联系邮箱"
            />
          </div>

          <div className="form-group">
            <label>GitHub</label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="GitHub 用户名或链接"
            />
          </div>

          <div className="form-group">
            <label>个人网站</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="个人网站链接"
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="editor-actions">
          <button className="btn-primary" onClick={handleSave}>
            保存
          </button>
          <button className="btn-secondary">
            预览
          </button>
        </div>
      </div>
    </div>
  );
}