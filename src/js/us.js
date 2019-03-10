import {Event_hub,generate_html_tmp,lazy_load} from './common'


class Us{
    constructor(){
        this.$container = $('#us')
        this.col_height_arr = []
        this.event_hub = Event_hub
        this.img_width = $('.waterfall img').outerWidth(true)
        this.col_Count =  Math.floor( $('.waterfall').width()/this.img_width )
        for(let i = 0;i < this.col_Count;i++){
            this.col_height_arr[i] = 0
        }
    }
    
    init(){
        this.bind()
        
    }
    
    bind(){
        let _this = this
        this.$container.on('click','.img-wrap',function(){
            _this.event_hub.emit('show_detail',$(this).data('movieId'))
        })
    }






}

export {Us}