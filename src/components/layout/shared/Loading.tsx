import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const Loading = () => {
    return (
        <Box className='flex justify-center items-center bs-full is-full min-bs-[50vh]'>
            <CircularProgress />
        </Box>
    )
}

export default Loading
