import {Route, Routes, BrowserRouter} from 'react-router-dom'
import Home from './components/home'
import ImageDisplay from './components/imageDisplay'



const App = () => {


    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/image/:id" element={<ImageDisplay/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App