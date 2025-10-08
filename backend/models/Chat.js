import mongoose from 'mongoose';

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
        name:{
            type: String,
            required: true
        },
        id:{
            type: String,
            required: true
        }
    },
    title: {
        type: String,
        default: "New Chat"
    },
    messages: [messagesSchema],
},{ timestamps: true });

export default mongoose.model('Chat', chatSchema);