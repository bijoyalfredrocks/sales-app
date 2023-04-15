import { useCallback, useContext, useEffect, useMemo } from "react"
import { DataTableContext } from "./DataTable"
import { Pagination as BootstrapPagination } from "react-bootstrap";
import { Search, Times } from "@styled-icons/fa-solid";

export default function Pagination({data}) {
  const { pagination, setPagination, lazyLoading, onUpdate, sortStatus, serverDataLength, setServerDataLength, advancedSearch, setFilterKey, setAdvancedSearchData, advancedSearchData, filterObjectFromFilterStatus, setSearchOpen} = useContext(DataTableContext);
  const {itemsPerPage } = pagination;

  useEffect(() => {
    if (!lazyLoading) {
      setPagination(prev => ({...prev, pageNo: 0}));
    }
  }, [data, setPagination, lazyLoading]);

  const lastPage = useMemo(() => {
    if (!lazyLoading)
      return Math.ceil(data.length / itemsPerPage);

    return Math.ceil(serverDataLength / itemsPerPage)

  }, [data.length, itemsPerPage, serverDataLength, lazyLoading]);

  const nextPage = useCallback(() => {
    if (pagination.pageNo + 1 < lastPage) {
      if (lazyLoading && typeof onUpdate == 'function')
        onUpdate(setServerDataLength, {...pagination, pageNo: pagination.pageNo + 1}, sortStatus, advancedSearchData, filterObjectFromFilterStatus())
      setPagination(prev => ({...prev, pageNo: prev.pageNo + 1}));
    }
  }, [setPagination, lastPage, lazyLoading, onUpdate, pagination, setServerDataLength, sortStatus, advancedSearchData]);

  const prevPage = useCallback(() => {
    if (pagination.pageNo - 1 >= 0) {
      if (lazyLoading && typeof onUpdate == 'function')
        onUpdate(setServerDataLength, {...pagination, pageNo: pagination.pageNo - 1}, sortStatus, advancedSearchData, filterObjectFromFilterStatus())
      setPagination(prev => ({...prev, pageNo: prev.pageNo - 1}));
    }
  }, [setPagination, lazyLoading, onUpdate, pagination, setServerDataLength, sortStatus, advancedSearchData]);

  // const clearSearch = () => {
  //   if (!lazyLoading)
  //     advancedSearch.onSubmit?.({});
  //   else {
  //     if (typeof onUpdate === 'function') 
  //       onUpdate(setServerDataLength, {...pagination, pageNo: 0},sortStatus, null)
  //     setPagination({...pagination, pageNo: 0})
  //     setAdvancedSearchData(null)
  //   }

  //   setFilterKey("");
  // }

  if (!pagination.itemsPerPage) return null;

  return (
    <div className="w-100 d-flex justify-content-end" style={{paddingBottom: '10px', paddingTop: pagination.areaPadding ?? '10px'}}>
      {/*<div>
         {advancedSearch && (
          <div className="d-flex align-items-center">
            <button type="button" className="invoice-add-btn green-text" onClick={() => setSearchOpen(true)} style={{gap: '0.1rem'}}>
              <Search width="0.9rem" height="0.9rem" />
              <span className="text-decoration-underline " style={{ fontSize: "0.7rem", padding: "0.2rem 0"}}>
                Advanced
              </span>
            </button>
            <button type="button" className="invoice-add-btn" onClick={clearSearch} style={{alignSelf: 'center', color: '#db4e7b', gap: '0.1rem'}}>
              
             
              <span className="text-decoration-underline " style={{ fontSize: "0.7rem", padding: "0.2"}}>
                Reset
              </span>
            </button>
          </div>
        )} 
      </div>*/}

        <div className="d-flex">
          {pagination.itemsPerPageOptions && (
          <label className="per-page-select" style={{height: '35px', marginRight: '50px'}}>
            <span className=""  style={{marginRight: '5px', fontSize: '11px'}}>Rows:</span>
            <select value={pagination.itemsPerPage} style={{fontSize: '10px'}} onChange={(e) => {
              if (lazyLoading && typeof onUpdate == 'function') onUpdate(setServerDataLength, {...pagination, pageNo: 0, itemsPerPage: parseInt(e.target.value)},sortStatus, advancedSearchData, filterObjectFromFilterStatus())
              setPagination(prev => ({...prev, pageNo: 0, itemsPerPage: parseInt(e.target.value)}))}
            }>

              {pagination.itemsPerPageOptions.map(x => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
        </label>
        )}

        <BootstrapPagination>
          <BootstrapPagination.First onClick={
            () => {
              if (lazyLoading && typeof onUpdate == 'function')
                onUpdate(setServerDataLength, {...pagination, pageNo: 0}, sortStatus, advancedSearchData, filterObjectFromFilterStatus())
              setPagination(prev => ({...prev, pageNo: 0}))} 
            }/>
          <BootstrapPagination.Prev onClick={prevPage} />
          {pagination.pageNo + 1 >= lastPage && pagination.pageNo - 2 >= 0 && <BootstrapPagination.Item onClick={() => {
            if (lazyLoading && typeof onUpdate == 'function')
            onUpdate(setServerDataLength, {...pagination, pageNo: pagination.pageNo - 2}, sortStatus, advancedSearchData, filterObjectFromFilterStatus())
            setPagination(prev => ({...prev, pageNo: prev.pageNo - 2}))}
          }>{pagination.pageNo - 1}</BootstrapPagination.Item>}

          {pagination.pageNo > 0 && <BootstrapPagination.Item onClick={() => {
            if (lazyLoading && typeof onUpdate == 'function')
              onUpdate(setServerDataLength, {...pagination, pageNo: pagination.pageNo - 1}, sortStatus, advancedSearchData, filterObjectFromFilterStatus())
            setPagination(prev => ({...prev, pageNo: prev.pageNo - 1}))}
          }>{pagination.pageNo}</BootstrapPagination.Item>}
          <BootstrapPagination.Item active>{pagination.pageNo + 1}</BootstrapPagination.Item>

          {pagination.pageNo + 1 < lastPage && <BootstrapPagination.Item onClick={() => {
            if (lazyLoading && typeof onUpdate == 'function')
              onUpdate(setServerDataLength, {...pagination, pageNo: pagination.pageNo + 1}, sortStatus, advancedSearchData, filterObjectFromFilterStatus())
            setPagination(prev => ({...prev, pageNo: prev.pageNo + 1}))}
          }>{pagination.pageNo + 2}</BootstrapPagination.Item>}

          {pagination.pageNo <= 0 && pagination.pageNo + 2 < lastPage && <BootstrapPagination.Item onClick={() => {
            if (lazyLoading && typeof onUpdate == 'function')
              onUpdate(setServerDataLength, {...pagination, pageNo: pagination.pageNo + 2}, sortStatus, advancedSearchData, filterObjectFromFilterStatus())
            setPagination(prev => ({...prev, pageNo: prev.pageNo + 2}))}
          }>{pagination.pageNo + 3}</BootstrapPagination.Item>}
          <BootstrapPagination.Next onClick={nextPage} />
          <BootstrapPagination.Last onClick={() => {
            if (lazyLoading && typeof onUpdate == 'function')
              onUpdate(setServerDataLength, {...pagination, pageNo: lastPage - 1}, sortStatus, advancedSearchData, filterObjectFromFilterStatus())
            setPagination(prev => ({...prev, pageNo: lastPage - 1}))} 
          }/>
        </BootstrapPagination>
      </div>

    </div>
  )
}