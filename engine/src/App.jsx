import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { DocumentDrawer } from "./components/DocumentDrawer";
import { SearchPalette } from "./components/SearchPalette";
import { CollectionPage } from "./pages/CollectionPage";
import { DouyinPage } from "./pages/DouyinPage";
import { DailyHotPage } from "./pages/DailyHotPage";
import { GraphPage } from "./pages/GraphPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { BooksPage } from "./pages/BooksPage";
import { OverviewPage } from "./pages/OverviewPage";
import { SystemPage } from "./pages/SystemPage";
import { TopicsPage } from "./pages/TopicsPage";
import { SocialInsightsPage, SocialTrendDetailPage } from "./pages/SocialInsightsPage";
import { CareerOverviewPage } from "./pages/CareerOverviewPage";
import { CareerJobsPage } from "./pages/CareerJobsPage";
import { CareerJobDetailPage } from "./pages/CareerJobDetailPage";
import { CareerApplicationsPage } from "./pages/CareerApplicationsPage";
import { CareerCurrentInterviewPage } from "./pages/CareerCurrentInterviewPage";
import { CareerInterviewPrepPage } from "./pages/CareerInterviewPrepPage";
import { CareerQuestionsPage } from "./pages/CareerQuestionsPage";
import { CareerProjectInterviewPage } from "./pages/CareerProjectInterviewPage";
import { CareerMockInterviewPage } from "./pages/CareerMockInterviewPage";
import { CareerResumePage } from "./pages/CareerResumePage";
import { CareerAssetProjectsPage } from "./pages/CareerAssetProjectsPage";
import { CareerSkillsPage } from "./pages/CareerSkillsPage";
import { CareerStoriesPage } from "./pages/CareerStoriesPage";
import { CareerDataManagementPage } from "./pages/CareerDataManagementPage";
import InterviewAssetCenterPage from "./pages/interview/InterviewAssetCenterPage";
import InterviewQuestionsPage from "./pages/interview/InterviewQuestionsPage";
import InterviewQuestionDetailPage from "./pages/interview/InterviewQuestionDetailPage";
import AiKnowledgeHomePage from "./pages/interview/AiKnowledgeHomePage";
import AiKnowledgeDetailPage from "./pages/interview/AiKnowledgeDetailPage";
import InterviewTopicsPage from "./pages/interview/InterviewTopicsPage";
import InterviewReviewsPage from "./pages/interview/InterviewReviewsPage";
import InterviewMyAnswersPage from "./pages/interview/InterviewMyAnswersPage";
import InterviewProjectDetailPage from "./pages/interview/InterviewProjectDetailPage";
import { AssetLibraryPage } from "./pages/AssetLibraryPage";
import { AssetDetailPage } from "./pages/AssetDetailPage";
import { AssetEditorPage } from "./pages/AssetEditorPage";
import { SkillEditorPage } from "./pages/SkillEditorPage";
import { PromptEditorPage } from "./pages/PromptEditorPage";
import { WorkflowEditorPage } from "./pages/WorkflowEditorPage";
import { ProductLibraryPage } from "./pages/ProductLibraryPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductEditorPage } from "./pages/ProductEditorPage";
import { AuthorProfilePage } from "./pages/AuthorProfilePage";
import { useVaultSync } from "./hooks/useVaultSync";

const localWorkbench = import.meta.env.VITE_WORKBENCH_HOSTED !== "true";

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [readerContext, setReaderContext] = useState(null);
  const vaultSync = useVaultSync(location.pathname);
  const routeRevision =
    location.pathname.startsWith("/social-insights")
    ? location.pathname
    : `${location.pathname}:${vaultSync.revision}`;

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setSelectedDocumentId(null);
    setReaderContext(null);
  }, [location.pathname]);

  const openDocument = useCallback((documentOrId) => {
    const id =
      typeof documentOrId === "string"
        ? documentOrId
        : documentOrId?.id ?? documentOrId?.relativePath;
    if (id) {
      setSelectedDocumentId(id);
      setReaderContext(
        typeof documentOrId === "object" ? documentOrId.readerContext || null : null,
      );
    }
  }, []);

  const appContext = useMemo(
    () => ({
      navigate,
      openDocument,
      openSearch: () => setSearchOpen(true),
    }),
    [navigate, openDocument],
  );

  return (
    <>
      <AppShell onOpenSearch={appContext.openSearch} sync={vaultSync}>
        <Routes key={routeRevision}>
          <Route path="/" element={<OverviewPage onOpenDocument={openDocument} />} />
          <Route path="/graph" element={<GraphPage onOpenDocument={openDocument} />} />
          <Route
            path="/wiki"
            element={
              <CollectionPage
                kind="wiki"
                eyebrow="KNOWLEDGE LAYER"
                title="Wiki 层"
                description="结构化知识：来源拆解、概念、框架、诊断与待验证问题。星图的线性视图。"
                onOpenDocument={openDocument}
              />
            }
          />
          <Route
            path="/materials"
            element={<MaterialsPage onOpenDocument={openDocument} />}
          />
          <Route path="/books" element={<BooksPage onOpenDocument={openDocument} />} />
          <Route path="/books/:bookId" element={<BooksPage onOpenDocument={openDocument} />} />
          <Route path="/daily-hot" element={<DailyHotPage />} />
          {localWorkbench ? (
            <Route
              path="/social-insights"
              element={
                <SocialInsightsPage
                  onOpenDocument={openDocument}
                  syncRevision={vaultSync.revision}
                />
              }
            />
          ) : null}
          {localWorkbench ? (
            <Route
              path="/social-insights/trends/:trendId"
              element={
                <SocialTrendDetailPage
                  onOpenDocument={openDocument}
                  syncRevision={vaultSync.revision}
                />
              }
            />
          ) : null}
          {localWorkbench ? (
            <Route
              path="/social-insights/:reportId"
              element={
                <SocialInsightsPage
                  onOpenDocument={openDocument}
                  syncRevision={vaultSync.revision}
                />
              }
            />
          ) : null}
          <Route
            path="/topics"
            element={<TopicsPage onOpenDocument={openDocument} />}
          />
          <Route
            path="/content"
            element={
              <CollectionPage
                kind="content"
                eyebrow="CONTENT PIPELINE"
                title="内容中心"
                onOpenDocument={openDocument}
              />
            }
          />
          <Route path="/douyin" element={<DouyinPage />} />
          <Route path="/career" element={<InterviewAssetCenterPage />} />
          <Route path="/career/jobs" element={<CareerJobsPage />} />
          <Route path="/career/jobs/:jobId" element={<CareerJobDetailPage />} />
          <Route path="/career/applications" element={<CareerApplicationsPage />} />
          <Route path="/career/interview" element={<InterviewAssetCenterPage />} />
          <Route path="/career/interview/topics" element={<InterviewTopicsPage />} />
          <Route path="/career/interview/reviews" element={<InterviewReviewsPage />} />
          <Route path="/career/interview/ai-knowledge" element={<AiKnowledgeHomePage />} />
          <Route path="/career/interview/ai-knowledge/:id" element={<AiKnowledgeDetailPage />} />
          <Route path="/career/interview/questions" element={<InterviewQuestionsPage />} />
          <Route path="/career/interview/questions/:id" element={<InterviewQuestionDetailPage />} />
          <Route path="/career/interview/my-answers" element={<InterviewMyAnswersPage />} />
          <Route path="/career/interview/projects/:projectId" element={<InterviewProjectDetailPage />} />
          <Route path="/career/interview/current" element={<CareerCurrentInterviewPage />} />
          <Route path="/career/interview/prep/:jobId" element={<CareerInterviewPrepPage />} />
          <Route path="/career/interview/mock" element={<CareerMockInterviewPage />} />
          <Route path="/career/assets/resume" element={<CareerResumePage />} />
          <Route path="/career/assets/projects" element={<CareerAssetProjectsPage />} />
          <Route path="/career/assets/skills" element={<CareerSkillsPage />} />
          <Route path="/career/assets/stories" element={<CareerStoriesPage />} />
          <Route path="/career/data" element={<CareerDataManagementPage />} />
          <Route path="/assets" element={<AssetLibraryPage />} />
          <Route path="/assets/new" element={<AssetEditorPage />} />
          <Route path="/assets/:assetId" element={<AssetDetailPage />} />
          <Route path="/assets/:assetId/edit" element={<AssetEditorPage />} />
          <Route path="/assets/skill/new" element={<SkillEditorPage />} />
          <Route path="/assets/prompt/new" element={<PromptEditorPage />} />
          <Route path="/assets/workflow/new" element={<WorkflowEditorPage />} />
          <Route path="/products" element={<ProductLibraryPage />} />
          <Route path="/products/new" element={<ProductEditorPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/products/:productId/edit" element={<ProductEditorPage />} />
          <Route path="/author" element={<AuthorProfilePage />} />
          <Route path="/system" element={<SystemPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </AppShell>

      <SearchPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenDocument={(document) => {
          openDocument(document);
          setSearchOpen(false);
        }}
      />

      <DocumentDrawer
        documentId={selectedDocumentId}
        onNavigateDocument={openDocument}
        onClose={() => {
          setSelectedDocumentId(null);
          setReaderContext(null);
        }}
        readingContext={readerContext}
      />
    </>
  );
}
