var React = require("react")
var {Pager, Spinner} = require("../../components")
var {hashHistory, Link} = require("react-router")
var {Api, Dialog} = require("../../services")
var {BootstrapTable, TableHeaderColumn} = require("react-bootstrap-table")

const pageSize = 20;

class PageList extends React.Component{
    constructor(){
        super()

        this.state = {
            loading: false,
            total: 0,
            pageList: [],
            selectAll: false,
            keywords: '',
            status: null,
            selectedList: []
        }
    }

    componentDidMount(){
        this.loadData()
    }

    loadData(){
        this.setState({
            loading: true
        }, ()=>{
            Api.queryPage(response=>{
                if(response.success){
                    this.setState({
                        loading: false,
                        pageList: response.data
                    });
                }
                else{
                    Dialog.error(response.errorMessage);
                }
            })
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
            Api.batchPublishPage(idList, this.apiCallback.bind(this))
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
            Api.batchDraftPage(idList, this.apiCallback.bind(this))
        })
    }

    remove(){

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

    canBatchOperate(){
        return this.state.selectedList.length > 0;
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
            arr = _.map(this.state.pageList, page=>page.id);
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
                <Link to={'/content/page/' + row.id}>{cell}</Link>
                <a title={"toView".L()} className="pull-right text-muted" target="_blank" href={'/page/' + (row.alias || row.id) }><i className="fa fa-external-link"></i></a>
            </div>
        )
    }

    formatParent(cell, row){
        if(cell){
            return cell.title;
        }
        else{
            return "";
        }
    }

    render(){
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
                    <Link to="/content/page" className="btn btn-success btn-sm" title={"add".L()}>
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
                </div>

                <div className="box box-solid">
                    <div className="box-body table-responsive no-padding">
                        <BootstrapTable keyField="id" data={this.state.pageList} selectRow={selectRowProp} options={{noDataText:"empty".L()}}>
                            <TableHeaderColumn dataField="title" dataFormat={this.formatTitle.bind(this)}>{"title".L()}</TableHeaderColumn>
                            <TableHeaderColumn width="100" dataAlign="center" dataField="parent" dataFormat={this.formatParent.bind(this)}>{"parent".L()}</TableHeaderColumn>
                            <TableHeaderColumn width="180" dataAlign="center" dataField="order">{"sorting".L()}</TableHeaderColumn>
                            <TableHeaderColumn width="100" dataAlign="center" dataField="status" dataFormat={this.formatStatus.bind(this)}>{"status".L()}</TableHeaderColumn>
                        </BootstrapTable>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = PageList