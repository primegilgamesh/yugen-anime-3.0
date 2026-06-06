import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ListProvider } from "@/contexts/ListContext";
import { ReviewsProvider } from "@/contexts/ReviewsContext";
import { ReviewLikesProvider } from "@/contexts/ReviewLikesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import "@/data/scheduleData"; // ensures schedule merges into allAnime so pages auto-generate
import ScrollToTop from "@/components/ScrollToTop";
import Home from "./pages/Home";
import AnimePage from "./pages/anime-archive/AnimePage";
import EpisodePlayerPage from "./pages/anime-archive/EpisodePlayerPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Trending from "./pages/Trending";
import Recents from "./pages/Recents";
import Discover from "./pages/Discover";
import MyList from "./pages/MyList";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import { NewPage, PopularPage, ReviewsPage } from "./pages/MorePages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationsProvider>
          <ListProvider>
            <ReviewsProvider>
              <ReviewLikesProvider>
              <Toaster />
              <Sonner position="top-right" />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/anime/:slug" element={<AnimePage />} />
                  <Route path="/anime/:slug/watch/:episode" element={<EpisodePlayerPage />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/trending" element={<Trending />} />
                  <Route path="/recents" element={<Recents />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/my-list" element={<MyList />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/new" element={<NewPage />} />
                  <Route path="/popular" element={<PopularPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              </ReviewLikesProvider>
            </ReviewsProvider>
          </ListProvider>
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
