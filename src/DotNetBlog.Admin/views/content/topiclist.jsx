var React = require("react")
var {Pager, Spinner} = require("../../components")
var {hashHistory, Link} = require("react-router")
var {Api, Dialog} = require("../../services")
var {BootstrapTable, TableHeaderColumn} = require("react-bootstrap-table")
var {reduxForm} = require("redux-form")

class SearchTopicForm extends React.Component{
    render(){
        const {fields: {status, keywords}, handleSubmit} = this.props

        return (
            <form noValidate onSubmit={handleSubmit}>
                <select className="form-control input-sm" {...status}>
                    <option value="">{"all".L()}</option>
                    <option value="0">{"draft".L()}</option>
                    <option value="1">{"published".L()}</option>
                </select>
                {' '}
                <input type="text" className="form-control input-sm" {...keywords}/>   
                {' '}
                <button type="submit" className="btn btn-default btn-sm">
                    <i className="fa fa-search"></i>
                </button>
            </form>
        )
    }
}

SearchTopicForm = reduxForm({
    form: "searchTopicForm",
    fields: ["status", "keywords"]
})(SearchTopicForm)

const pageSize = 20;

class TopicList extends React.Component{
    constructor(){
        super()

        this.state = {
            loading: false,
            total: 0,
            topicList: [],
            selectAll: false,
            keywords: '',
            status: null,
            selectedList: []
        }
    }

    remove(){
        var idList = this.state.selectedList;
        if(idList.length == 0){
            return;
        }

        if(this.state.loading){
            return;
        }

        this.setState({loading: true}, ()=>{
            Api.batchTrashTopic(idList, this.apiCallback.bind(this))
        })
    }

    publish(){
        var idList = this.state.selectedList;
        if(idList.length == 0){
            return;
        }

        if(this.state.loading){
            return;
        }

        this.setState({loading: true}, ()=>{
            Api.batchPublishTopic(idList, this.apiCallback.bind(this))
        })
    }

    draft(){
        var idList = this.state.selectedList;
        if(idList.length == 0){
            return;
        }

        if(this.state.loading){
            return;
        }

        this.setState({loading: true}, ()=>{
            Api.batchDraftTopic(idList, this.apiCallback.bind(this))
        })
    }

    apiCallback(response){
        this.setState({
            loading: false
        });

        if(response.success){
            Dialog.success("operationSuccessful".L());
            this.loadData()
        }
        else{
            Dialog.error(response.errorMessage);
        }
    }

    componentDidMount(){
        this.state.status = this.props.location.query.status;
        this.state.keywords = this.props.location.query.keywords;
        this.loadData()
    }

    componentDidUpdate(prevProps){
        if(prevProps.location.query.page != this.props.location.query.page
            || prevProps.location.query.keywords != this.props.location.query.keywords
            || prevProps.location.query.status != this.props.location.query.status
        ){
            this.loadData()
        }
    }

    loadData(){
        let page = this.props.location.query.page || 1;
        let keywords = this.props.location.query.keywords;
        let status = this.props.location.query.status;

        this.setState({
            loading: true
        }, ()=>{
            Api.queryNormalTopic(page, pageSize, status, keywords, response=>{
                if(response.success){
                    _.forEach(response.data, topic=>{
                        topic.checked = false
                    });

                    this.setState({
                        selectAll: false,
                        loading: false,
                        topicList: response.data,
                        total: response.total,
                        selectedList: []
                    })
                }
                else{
                    this.setState({
                        loading: false,
                        selectedList: []
                    });
                    Dialog.error(response.errorMessage);
                }
            })
        })
    }

    canBatchOperate(){
        if(!this.state.topicList){
            return false;
        }
        return this.state.selectedList.length > 0;
    }

    search(model){
        this.changePage(1, model.status, model.keywords)
    }

    handlePageChange(page){
        this.changePage(page, this.props.location.query.status, this.props.location.query.keywords)
    }

    changePage(page, status, keywords){
        hashHistory.push({
            pathname: "content/topics",
            query:{
                page: page,
                status: status,
                keywords: keywords
            }
        })
    }

    handleSelect(row, selected){
        var arr = this.state.selectedList;

        if(selected){
            arr.push(row.id);
        }
        else{
            _.remove(arr, item=>item == row.id);
        }

        this.setState({
            selectedList: arr
        });
    }

    handleSelectAll(selected){
        var arr = this.state.selectedList;
        arr = [];
        if(selected){
            arr = _.map(this.state.topicList, topic=>topic.id);
        }

        this.setState({
            selectedList: arr
        });
    }

    formatStatus(cell, row){
        let className = "";
        let text = "";

        switch(cell){
            case 0:
                className = "warning";
                text = "draft".L();
            break;
            case 1:
                className = "success";
                text = "published".L();
            break;
        }

        className = 'text-' + className;

        return (
            <span className={className}>
                <strong>{text}</strong>
            </span>
        )
    }

    formatTitle(cell, row){
        return (
            <div>
                <Link to={'/content/topic/' + row.id}>{cell}</Link>
                <a title={"toView".L()} className="pull-right text-muted" target="_blank" href={'/topic/' + (row.alias || row.id) }><i className="fa fa-external-link"></i></a>
            </div>
        )
    }

    formatComments(cell, row){
        return (
            <span className="badge">{cell.approved}</span>
        )
    }

    render(){
        let page = this.props.location.query.page || 1;

        const selectRowProp = {
            mode: 'checkbox',
            onSelect: this.handleSelect.bind(this),
            onSelectAll: this.handleSelectAll.bind(this),
            selected: this.state.selectedList
        };
        
        return (
            <div className="content">
                <Spinner loading={this.state.loading}/>

                <div className="mailbox-controls">
                    <Link to="/content/topic" className="btn btn-success btn-sm" title={"add".L()}>
                        <i className="fa fa-plus"></i>
                    </Link>
                    {' '}

                    <div className="btn-group">
                        <button className="btn btn-success btn-sm" title={"publish".L()} disabled={!this.canBatchOperate()} onClick={this.publish.bind(this)}>
                            <i className="fa fa-check"></i>
                        </button>   
                        <button className="btn btn-warning btn-sm" title={"cancelThePublish".L()} disabled={!this.canBatchOperate()} onClick={this.draft.bind(this)}>
                            <i className="fa fa-archive"></i>
                        </button>   
                        <button className="btn btn-danger btn-sm" title={"delete".L()} disabled={!this.canBatchOperate()} onClick={this.remove.bind(this)}>
                            <i className="fa fa-trash"></i>
                        </button>   
                    </div>

                    <div className="pull-right form-inline">
                        <SearchTopicForm onSubmit={this.search.bind(this)} initialValues={this.props.location.query}></SearchTopicForm>
                    </div>
                </div>

                <div className="box box-solid">
                    <div className="box-body table-responsive no-padding">
                        <BootstrapTable keyField="id" data={this.state.topicList} selectRow={selectRowProp} options={{noDataText:"empty".L()}}>
                            <TableHeaderColumn dataField="title" dataFormat={this.formatTitle.bind(this)}>{"article".L()}</TableHeaderColumn>
                            <TableHeaderColumn width="100" dataAlign="center" dataField="comments" dataFormat={this.formatComments.bind(this)}>{"comment".L()}</TableHeaderColumn>
                            <TableHeaderColumn width="180" dataAlign="center" dataField="date">{"date".L()}</TableHeaderColumn>
                            <TableHeaderColumn width="100" dataAlign="center" dataField="status" dataFormat={this.formatStatus.bind(this)}>{"status".L()}</TableHeaderColumn>
                        </BootstrapTable>
                    </div>
                </div>               

                <Pager page={page} pageSize={pageSize} total={this.state.total} onPageChange={this.handlePageChange.bind(this)}/>
            </div>
        )
    }
}

module.exports = TopicList