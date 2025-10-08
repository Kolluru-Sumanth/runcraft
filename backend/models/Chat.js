const mongoose=require('mongoose');
const messagesSchema = mongoose.Schema({
    role:{
        enum: ['user', 'ai', 'system'],
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    }
},{ timestamps: true });

const chatSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workflow:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workflow',
        required: true
    },
    container:{
            type: String,
            default: ""
    },
    url:{
        type: String,
        default: ""
    },
    messages: [messagesSchema],
},{ timestamps: true });

export default mongoose.model('Chat', chatSchema);