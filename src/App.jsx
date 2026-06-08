import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import MembershipDetail from './pages/MembershipDetail.jsx'
import Compare from './pages/Compare.jsx'
import MyBenefits from './pages/MyBenefits.jsx'
import Quiz from './pages/Quiz.jsx'
import RequestAssistance from './pages/RequestAssistance.jsx'
import Partner from './pages/Partner.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/membership/:id" element={<MembershipDetail />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/my-benefits" element={<MyBenefits />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/help" element={<RequestAssistance />} />
        <Route path="/partner" element={<Partner />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
