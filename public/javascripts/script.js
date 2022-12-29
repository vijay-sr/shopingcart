function addToCart(proId){
$.ajax({
    url:'/addCart/'+proId,
    method:'get',
    success:(response)=>{
        if(response.status){
            let count=$('#cart-count').html()
            count=parseInt(count)+1
            $('#cart-count').html(count)
        }
    }
})
}