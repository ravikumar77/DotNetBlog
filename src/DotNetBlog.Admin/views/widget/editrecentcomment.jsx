var React = require("react")
var {Modal, ModalHeader, ModalFooter, ModalBody} = require("react-bootstrap")
var {Bootstrap: {FormGroup}} = require("../../components")
var {reduxForm} = require('redux-form')

const validate = values=>{
    const errors = {};
    if(!values.title){
        errors.title = "请输入标题";
    }
    if(!values.number){
        errors.number = "请输入评论数目";
    }
    
    let number = parseInt(values.number);
    if(isNaN(Number(values.number)) || number < 1){
        errors.number = "请输入正确的评论数量";
    }

    return errors;
}

class EditRecentCommentForm extends React.Component{
    render(){
        const {fields: {title, number}, handleSubmit} = this.props;
        return (
            <form noValidate onSubmit={handleSubmit}>    
                <FormGroup label="标题" hasError={title.touched && title.error}>
                    <input className="form-control" {...title}></input>
                    {title.touched && title.error && <span className="help-block">{title.error}</span>}
                </FormGroup>    
                <FormGroup label="显示评论数目" hasError={number.touched && number.error}>
                    <input className="form-control" {...number}></input>
                    {number.touched && number.error && <span className="help-block">{number.error}</span>}
                </FormGroup>    
            </form>
        )
    }
}

EditRecentCommentForm = reduxForm({
    form: "editRecentComment",
    fields: ["title", "number"],
    validate
})(EditRecentCommentForm)

class EditRecentComment extends React.Component{
    constructor(){
        super()
        
        this.state = {
            show: false,
            config: {
                title: "",
                number: 0
            }
        }
    }

    show(widget, index){
        this.widget = widget;
        this.index = index;
        this.setState({
            show: true,
            config: widget.config
        });
    }

    hide(){
        this.setState({
            show: false
        })
    }

    onSubmit(model){
        this.widget.config.title = model.title;
        this.widget.config.number = model.number;
        this.props.onSave && this.props.onSave(this.widget, this.index);
        this.hide()
    }

    submit(){
        
        this.refs.form.submit()
    }
    
    render(){
        return (
            <Modal show={this.state.show}>    
                <ModalHeader>修改配置</ModalHeader>
                <ModalBody>
                    <EditRecentCommentForm 
                        ref="form"
                        initialValues={this.state.config}
                        onSubmit={this.onSubmit.bind(this)}/>
                </ModalBody>
                <ModalFooter>
                    <button type="button" className="btn btn-default" onClick={this.hide.bind(this)}>取消</button>
                    <button type="submit" className="btn btn-primary" onClick={this.submit.bind(this)}>保存</button>
                </ModalFooter>
            </Modal>
        )
    }
}

module.exports = EditRecentComment