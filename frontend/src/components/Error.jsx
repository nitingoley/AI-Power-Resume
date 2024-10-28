import React from 'react'
import {Link} from "react-router-dom";


const Error = () => {
  return (
    <div className='error-container'> 
    <h1 className='error-title'>Oops! something went wrong </h1>
      <p className='error-message'>
      We couldn't find the information you're looking for. Please try again later or contact support if the issue persists.
      </p>
    <button> <Link>Go Back</Link></button>
    </div>
  )
}

export default Error
