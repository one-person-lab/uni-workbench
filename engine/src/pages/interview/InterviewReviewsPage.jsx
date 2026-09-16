// 面试复盘页面 - 采用 vibe-hub.org 分类列表风格

import { useState, useEffect } from 'react';
import { interviewKnowledgeStorage } from '../../career/interviewStorage.js';

export default function InterviewReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newReview, setNewReview] = useState({
    company: '',
    position: '',
    date: '',
    round: '',
    overallRating: 3,
    technicalRating: 3,
    communicationRating: 3,
    strengths: '',
    weaknesses: '',
    keyQuestions: '',
    improvements: '',
    nextSteps: '',
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    const savedReviews = interviewKnowledgeStorage.getInterviewReviews();
    setReviews(savedReviews);
  };

  const handleCreateReview = () => {
    const review = {
      id: `review_${Date.now()}`,
      ...newReview,
      createdAt: new Date().toISOString(),
    };

    interviewKnowledgeStorage.addInterviewReview(review);
    loadReviews();
    
    setIsCreating(false);
    setNewReview({
      company: '',
      position: '',
      date: '',
      round: '',
      overallRating: 3,
      technicalRating: 3,
      communicationRating: 3,
      strengths: '',
      weaknesses: '',
      keyQuestions: '',
      improvements: '',
      nextSteps: '',
    });
  };

  const handleDeleteReview = (id) => {
    const updatedReviews = reviews.filter(r => r.id !== id);
    setReviews(updatedReviews);
  };

  const handleRatingChange = (field, value) => {
    setNewReview(prev => ({ ...prev, [field]: parseInt(value) }));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">面试复盘</h1>
        <p className="text-gray-600">记录面试经历，总结经验教训</p>
      </div>

      {/* 操作按钮 */}
      <div className="mb-6">
        <button
          onClick={() => setIsCreating(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 新增复盘
        </button>
      </div>

      {/* 创建复盘表单 */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-2 border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">新增面试复盘</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">公司</label>
              <input
                type="text"
                value={newReview.company}
                onChange={(e) => setNewReview(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">岗位</label>
              <input
                type="text"
                value={newReview.position}
                onChange={(e) => setNewReview(prev => ({ ...prev, position: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">面试日期</label>
              <input
                type="date"
                value={newReview.date}
                onChange={(e) => setNewReview(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">面试轮次</label>
              <select
                value={newReview.round}
                onChange={(e) => setNewReview(prev => ({ ...prev, round: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择轮次</option>
                <option value="一面">一面</option>
                <option value="二面">二面</option>
                <option value="三面">三面</option>
                <option value="HR面">HR面</option>
                <option value="终面">终面</option>
              </select>
            </div>
          </div>

          {/* 评分 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">整体评分 (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={newReview.overallRating}
                onChange={(e) => handleRatingChange('overallRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">技术评分 (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={newReview.technicalRating}
                onChange={(e) => handleRatingChange('technicalRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">沟通评分 (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={newReview.communicationRating}
                onChange={(e) => handleRatingChange('communicationRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 文本输入 */}
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">优势</label>
              <textarea
                value={newReview.strengths}
                onChange={(e) => setNewReview(prev => ({ ...prev, strengths: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">待改进</label>
              <textarea
                value={newReview.weaknesses}
                onChange={(e) => setNewReview(prev => ({ ...prev, weaknesses: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">关键问题</label>
              <textarea
                value={newReview.keyQuestions}
                onChange={(e) => setNewReview(prev => ({ ...prev, keyQuestions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">改进计划</label>
              <textarea
                value={newReview.improvements}
                onChange={(e) => setNewReview(prev => ({ ...prev, improvements: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">下一步行动</label>
              <textarea
                value={newReview.nextSteps}
                onChange={(e) => setNewReview(prev => ({ ...prev, nextSteps: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button
              onClick={handleCreateReview}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              保存
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 复盘列表 */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            暂无复盘记录，点击上方按钮新增
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {review.company} - {review.position}
                  </h3>
                  <div className="text-sm text-gray-500 mt-1">
                    {review.date} · {review.round}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  删除
                </button>
              </div>

              {/* 评分 */}
              <div className="flex gap-4 mb-4 text-sm">
                <div className="bg-blue-50 px-3 py-1 rounded">
                  <span className="text-gray-600">整体:</span>
                  <span className="ml-1 font-semibold text-blue-600">{review.overallRating}/5</span>
                </div>
                <div className="bg-green-50 px-3 py-1 rounded">
                  <span className="text-gray-600">技术:</span>
                  <span className="ml-1 font-semibold text-green-600">{review.technicalRating}/5</span>
                </div>
                <div className="bg-purple-50 px-3 py-1 rounded">
                  <span className="text-gray-600">沟通:</span>
                  <span className="ml-1 font-semibold text-purple-600">{review.communicationRating}/5</span>
                </div>
              </div>

              {/* 详细内容 */}
              {review.strengths && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">优势</div>
                  <div className="text-sm text-gray-600">{review.strengths}</div>
                </div>
              )}
              {review.weaknesses && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">待改进</div>
                  <div className="text-sm text-gray-600">{review.weaknesses}</div>
                </div>
              )}
              {review.keyQuestions && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">关键问题</div>
                  <div className="text-sm text-gray-600">{review.keyQuestions}</div>
                </div>
              )}
              {review.improvements && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">改进计划</div>
                  <div className="text-sm text-gray-600">{review.improvements}</div>
                </div>
              )}
              {review.nextSteps && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">下一步行动</div>
                  <div className="text-sm text-gray-600">{review.nextSteps}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}