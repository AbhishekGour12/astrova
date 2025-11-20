import api from "./api"


export const authAPI ={
    resigter: async (userdata) =>{
        try{
        const response = await api.post('/auth/register', userdata);
        return response.data
        }catch (error){
            console.log(error.message)
            const errorMessage = error.response?.data?.message || 'Registration failed. please try again.';
            throw new Error (errorMessage);
        }

    },
    login: async (userdata) =>{
        try{
        const response = await api.post('/auth/login', userdata);
        return response.data
        }catch (error){
            console.log(error)
            const errorMessage = error.response?.data?.message || 'Login failed. please try again.';
            throw new Error (errorMessage);
        }

    },

    getProfile: async (token) =>{
        try{
        const response = await api.get(`/auth/profile/${token}`);
        return response.data
        }catch (error){
            const errorMessage = error.response?.data?.message || 'Failed to fetch profile. please try again.';
            throw new Error (errorMessage);
        }

    },

    updateProfil: async (userdata) =>{
        try{
        const response = await api.put('/auth/profile', userdata);
        return response.data
        }catch (error){
            const errorMessage = error.response?.data?.message || 'Failed to update profile. please try again.';
            throw new Error (errorMessage);
        }
    },
    userFind: async (phone) =>{
        try{
       
        const response = await api.get(`/auth/userfind/${phone}`);
        return response.data
        }catch (error){
            const errorMessage = error.response?.data?.message || 'Failed to find user. please try again.';
            throw new Error (errorMessage);
        }
    },
    requestotp: async (phone) =>{
        try{
            const response = await api.put(`/auth/requestotp/${phone}`);
            return response.data
        }catch (error){
            const errorMessage = error.response?.data?.message || 'Failed to send OTP. please try again.';
            throw new Error (errorMessage);
        }
    },
    verifyotp: async (data) =>{
       try{
            const response = await api.post(`/auth/verifyotp`, data);
            return response.data
        }catch (error){
            const errorMessage = error.response?.data?.message || 'Failed to send OTP. please try again.';
            throw new Error (errorMessage);
        }
    },

    logout: () =>{
        localStorage.removeItem("token");


    }
}
