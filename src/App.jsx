import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux';

import Body from './components/Body'
import Login from './components/Login'
import Profile from './components/Profile'
import appStore from './utils/appStore'
import Feed from './components/Feed';
import Connections from './components/Connections';
import Requests from './components/Requests';
import Premium from './components/Premium';
import Chat from './components/Chat';

import ProtectedRoute from './middlewares/ProtectedRoute';
import UserProfile from './components/UserProfile';

function App() {

  return (
    <>
      <Provider store={appStore}>
        <BrowserRouter basename='/'>
          <Routes>
            <Route path='/' element={<Body />}>
              <Route index element={<Feed />} /> 
              <Route path='login' element={<Login />} />
              <Route path='profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="view/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path='connections' element={<ProtectedRoute><Connections /></ProtectedRoute>} />
              <Route path='requests' element={<ProtectedRoute><Requests /></ProtectedRoute>} />
              <Route path='premium' element={<ProtectedRoute><Premium /></ProtectedRoute>} />
              <Route path='chat/:targetUserId' element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path='*' element={<Login />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>

    </>
  )
}

export default App
