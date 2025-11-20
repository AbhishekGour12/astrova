const { createSlice } = require("@reduxjs/toolkit");



const productTypeSlice = createSlice({
    name: 'productType',
    initialState: {
        value: ""
    },

    reducers: {
      productsType:  (state, action) =>{
        state.value = action.payload
    }
}

})

export const {productsType} = productTypeSlice.actions;
export default productTypeSlice.reducer