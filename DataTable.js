import { Filter, Times } from "@styled-icons/fa-solid";
import _, { filter } from "lodash";
import React, { createContext, lazy, useCallback, useContext, useEffect, useMemo, useRef, useState, useReducer } from "react";
import { Col, Modal, OverlayTrigger, Popover, Row, Table } from "react-bootstrap";
import Pagination from "./Pagination";
import ConditionalWrapper from "../Util/ConditionalWrapper";
import { Input, Select } from "../Input/Input";
import { EllipsisV, ChevronUp } from "@styled-icons/fa-solid";
import drArrow from '../../images/downRightArrow.svg'
import { Search } from "@styled-icons/fa-solid";
import ReactDOM from "react-dom";

function SortUp(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 136.957 179.027" fill="currentColor" {...props}>
      <path d="M 15.218 76.726 L 60.87 76.726 C 69.273 76.726 76.087 71 76.087 63.939 C 76.087 56.877 69.273 51.151 60.87 51.151 L 15.645 51.151 C 7.242 51.151 0.428 56.877 0.428 63.939 C 0.428 71 6.801 76.726 15.218 76.726 Z M 15.218 127.877 L 91.304 127.877 C 99.707 127.877 106.522 122.15 106.522 115.089 C 106.522 108.028 99.707 102.301 91.304 102.301 L 15.645 102.301 C 7.242 102.301 0.428 108.028 0.428 115.089 C 0.428 122.15 6.801 127.877 15.218 127.877 Z M 15.218 25.576 L 30.434 25.576 C 38.838 25.576 45.224 19.849 45.224 12.788 C 45.224 5.727 38.41 0 30.434 0 L 15.218 0 C 6.815 0 0 5.727 0 12.788 C 0 19.849 6.801 25.576 15.218 25.576 Z M 121.739 153.452 L 15.645 153.452 C 7.242 153.452 0.428 159.179 0.428 166.24 C 0.428 173.301 7.242 179.027 15.645 179.027 L 121.739 179.027 C 130.141 179.027 136.957 173.301 136.957 166.24 C 136.957 159.179 130.156 153.452 121.739 153.452 Z" />
    </svg>
  );
}

function SortDown(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 136.957 179.027" fill="currentColor" {...props}>
      <path d="M 15.218 102.301 L 60.87 102.301 C 69.273 102.301 76.087 108.027 76.087 115.088 C 76.087 122.15 69.273 127.876 60.87 127.876 L 15.645 127.876 C 7.242 127.876 0.428 122.15 0.428 115.088 C 0.428 108.027 6.801 102.301 15.218 102.301 Z M 15.218 51.15 L 91.304 51.15 C 99.707 51.15 106.522 56.877 106.522 63.938 C 106.522 70.999 99.707 76.726 91.304 76.726 L 15.645 76.726 C 7.242 76.726 0.428 70.999 0.428 63.938 C 0.428 56.877 6.801 51.15 15.218 51.15 Z M 15.218 153.451 L 30.434 153.451 C 38.838 153.451 45.224 159.178 45.224 166.239 C 45.224 173.3 38.41 179.027 30.434 179.027 L 15.218 179.027 C 6.815 179.027 0 173.3 0 166.239 C 0 159.178 6.801 153.451 15.218 153.451 Z M 121.739 25.575 L 15.645 25.575 C 7.242 25.575 0.428 19.848 0.428 12.787 C 0.428 5.726 7.242 0 15.645 0 L 121.739 0 C 130.141 0 136.957 5.726 136.957 12.787 C 136.957 19.848 130.156 25.575 121.739 25.575 Z" />
    </svg>
  );
}

function FilterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props} fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"></path></svg>
  );
}

/** @typedef {({id: string | number} & Record<string, any>)} Item */
/** @typedef {{pageNo: number, itemsPerPage: number, itemsPerPageOptions: number[]}} PaginationState */

/**
 * @typedef {Object} DataTableContextType
 * @property {Item[]} data
 * @property {Array<ColumnProps & {selectConfig: SelectConfig}>} columns
 * @property {AllHTMLAttributes} headerAttrs
 * @property {PaginationState} pagination
 * @property {(x: PaginationState | (prev: PaginationState) => PaginationState) => void} setPagination
 * @property {boolean} sortable
 * @property {boolean} filterable
 * @property {(key: string, direction: 'asc' | 'desc') => void} sortOnKey
 * @property {{currentKey: string, direction: 'asc' | 'desc'}} sortStatus
 * @property {string} idKey
 */

/**
 * @typedef {Object} ColumnProps
 * @property {string} [colKey] - specifies the property key in any given `item` to match.
 * @property {boolean} [hidden] - if column should be shown visually, useful for columns that can be searched but no in the main list.
 * @property {string} header - text to display in `thead` element.
 * @property {string} [className]
 * @property {string} [errorKey]
 * @property {import("react").CSSProperties} [style]
 * @property {import("react").CSSProperties} [headerStyle]
 * @property {string} [headerClassName]
 * @property {string} [type]
 * @property {(a: any, b: any) => 1 | -1 | 0} [sort] - custom sort function, `a` and `b` are the values for `colKey` of the rows being compared. Cannot be used on a column that doesn't have a `colKey`.
 * @property {ColumnSearchConfig} [searchOpts] - specifies configuration for advanced search -  see {@link ColumnSearchConfig}
 * @property {(value: string) => NonNullable<any>} [beforeChange]
 * @property {(event: MouseEvent, item: import("./DataTable").Item) => void} [onClick]
 * @property {(Item) => JSX.Element | import("react").ReactChildren} [children] - TODO: document this
 * @property {string} [maxWidth] - maximum width (can be specified in `px`, `em`, `ch`, etc.). Overflowing text will be hidden via ellipsis `...`.
 */

/**
 * @typedef {Object} RowProps
 * @property {string | (item: Item) => string} className - determines classes applied to `<tr>` elements.
 */

/**
 * @typedef {Object} PaginationProps
 * @property {number | 'user'} itemsPerPage - how many items each page should display.
 */

/**
 * @typedef {Object} SelectConfig
 * @property {Array[]} options
 * @property {string} optionIdKey
 * @property {string} optionDisplayKey
 */

/**
 * @typedef {Object} CheckboxConfig
 */

/**
 * @typedef {Object} AdvancedSearchConfig
 * @property {() => boolean} onSubmit
 */

/**
 * @typedef {Object} TextSearchConfig
 * @property {"text"} type
 *
 * @typedef {Object} SelectSearchConfig
 * @property {"select"} type
 * @property {any[] | "data"} src
 *
 * @typedef {Object} DateSearchConfig
 * @property {"date"} type
 *
 * @typedef {Object} NumberSearchConfig
 * @property {"number"} type
 * @property {number} min
 * @property {number} max
 *
 * @typedef {(TextSearchConfig | SelectSearchConfig | DateSearchConfig | NumberSearchConfig) & {sendAs: string}} ColumnSearchConfig - indicates the type of search to perform on this column; automatically generates input for search modal.
 */

/** @type {React.Context<DataTableContextType>} */
export const DataTableContext = createContext({});

/**
 * @typedef {Object} DataTableHandleProps
 * @property {boolean} {@link Symbol.for("DataTableHandleRef")} - internal use only.
 * @property {Item[]} modifiedData - contains a reference to `localData`, which tracks changes to the internal table data from `editable` columns.
 * @property {() => void} reset - removes any changes from `modifiedData` and sets `localData` back to `data`.
 * @property {(rowId: string, colKey: string, newValue: any) => void} mutate - updates the given value in' localdata.
 * @property {{filterByKey: string | undefined, filterText: string }} filterStatus
 * @property {{currentKey: string | undefined, direction: string | undefined }} sortStatus
 * @property {{itemsPerPage: number | undefined, itemsPerPageOptions: number | number[], pageNo: number}} pagination
 * @property {(props: {filterByKey: string | undefined, filterText: string }) => ({filterByKey: string | undefined, filterText: string })} setFilterStatus
 * @property {(props: {currentKey: string | undefined, direction: string | undefined }) => ({currentKey: string | undefined, direction: string | undefined })} setSortStatus
 * @property {(props: {itemsPerPage: number | undefined, itemsPerPageOptions: number | number[], pageNo: number}) => ({itemsPerPage: number | undefined, itemsPerPageOptions: number | number[], pageNo: number})} setPagination
 */

/**
 *
 * @returns {React.MutableRefObject<DataTableHandleProps>} ref
 */
export function useDataTableHandle() {
  const ref = useRef({
    [Symbol.for("DataTableHandleRef")]: true,
    modifiedData: [],
    mutate: () => null,
    reset: () => null,
    sortStatus: {},
    pagination: {}
  });
  return ref;
}

/**
 *
 * @param {Object} props
 * @param {Item[]} props.data - data to be rendered by table.
 * @param {string} props.className - classes passed directly to table element.
 * @param {boolean} props.sortable - allows sorting table by clicking on the headers.
 * @param {boolean} props.editable - indicates that this table contains editable columns.
 * @param {boolean} props.filterable - allows filtering.
 * @param {AdvancedSearchConfig} props.advancedSearch - configures the advanced search.
 * @param {React.MutableRefObject} props.handle - a 2 way handle; created using `useDataTableHandle` hook.
 * @param {string} props.idKey - the property that acts as unique ID
 * @returns
 */
const DataTable = ({ data, editable, sortable, filterable, lazyLoading, onUpdate, onPaginationLoaded, advancedSearch, className, handle, children, idKey = "id", dontRefreshPagination, refreshTable, onMutate, showAdvnSearch=false}) => {
  const [localData, setLocalData] = useState([]);
  const [advancedSearchData, setAdvancedSearchData] = useState(null);
  const [rowExpanded, setRowExpanded] = useState(null);

  useEffect(() => {
    if (editable && sortable) {
      throw new Error("Setting both `editable` and `sortable` to `true` is not supported.");
    }
  }, [editable, sortable]);

  useEffect(() => {
    if (editable) {
      setLocalData(_.cloneDeep(data)); // we only need a deep clone if we're going to allow the user to edit the data.
    } else {
      setLocalData(data);
    }
  }, [data, editable]);

  useEffect(() => {
    if (typeof onMutate === 'function')
      onMutate(localData);
  }, [localData, onMutate])

  // Check if the provided 'handle' is valid.
  useEffect(() => {
    if (handle) {
      if (!handle?.current?.[Symbol.for("DataTableHandleRef")]) {
        throw new Error("`handle` prop must be created using `useDataTableHandle`.");
      }
    }
  }, [handle]);

  // When the handle is registered (or the data changes); create the reset function.
  // When invoked, the reset function removes all local edits/modifications and sets data back to default.
  useEffect(() => {
    if (handle?.current) {
      handle.current.reset = () => setLocalData(_.cloneDeep(data));
    }
  }, [handle, data]);

  // When the localData is modified (or the handle changes); set the modified data 'cache' to a shallow copy.
  // We can shallow copy here because the modifiedData object |shouldn't| be mutated.
  useEffect(() => {
    if (handle?.current) {
      handle.current.modifiedData = localData;
    }
  }, [localData, handle]);

  /**
   * @type {{columns: Array<ColumnProps & {selectConfig: SelectConfig}>, any, any}}
   * Automatically maps the child columns into configuration objects from their props.
   * */
  const { columns, headerAttrs, paginationProps, rowProps, headArea, colSpan, foldedColCount } = useMemo(() => {
    const config = {
      columns: [],
      headerAttrs: undefined,
      paginationProps: undefined,
      rowProps: undefined,
      headArea: undefined,
      colSpan: undefined,
      foldedColCount: undefined
    };

    React.Children.forEach(children, (child) => {
      if (child?.type?.displayName === "Column") {
        const currentColumnConfig = {
          colKey: child.props.colKey,
          header: child.props.header,
          className: child.props.className,
          style: child.props.style,
          headerStyle: child.props.headerStyle,
          headerClassName: child.props.headerClassName,
          onClick: child.props.onClick,
          children: child.props.children,
          maxWidth: child.props.maxWidth,
          editable: child.props.editable,
          locked: child.props.locked,
          type: child.props.type,
          beforeChange: child.props.beforeChange,
          sort: child.props.sort,
          searchOpts: child.props.searchOpts,
          errorKey: child.props.errorKey,
          foldable: child.props.foldable
        };

        if (child.props.editable) {
          if (!editable) throw new Error("Cannot have editable column in non-editable table.");
          if (!child.props.colKey) throw new Error("Cannot mark column as editable if no colKey is provided.");
        }
        if (typeof child.props.sort === "function" && !child.props.colKey) {
          console.warn("Found `sort` function attached to column with no `colKey`. This is not supported so sorting is disabled for this column.");
        }

        if (React.Children.count(child.props.children) === 1) {
          const subchild = child.props.children;
          if (subchild?.type?.displayName === "SelectConfig") {
            if (!editable || !child.props.editable) {
              throw new Error("Cannot have `Select` component in a table/column that is not `editable`.");
            }

            currentColumnConfig.selectConfig = {
              options: subchild.props.options,
              optionIdKey: subchild.props.optionIdKey,
              optionDisplayKey: subchild.props.optionDisplayKey,
            };
          }
          else if (subchild?.type?.displayName === "CheckboxConfig") {
            if (!editable || !child.props.editable) {
              throw new Error("Cannot have `Checkbox` component in a table/column that is not `editable`.");
            }
            currentColumnConfig.checkboxConfig = true
          }
        }

        config.columns.push(currentColumnConfig);
      } else if (child?.type?.displayName === "RowConfig") {
        if (config.rowProps === undefined) {
          config.rowProps = { ...child.props };
        } else {
          throw new Error("Found 1+ `DataTable.Row`s inside `DataTable`.");
        }
      } else if (child?.type?.displayName === "HeadersConfig") {
        if (config.headerAttrs === undefined) {
          config.headerAttrs = { ...child.props };
        } else {
          throw new Error("Found 1+ `DataTable.Headers`s inside of `DataTable`.");
        }
      } else if (child?.type?.displayName === "PaginationConfig") {
        if (config.paginationProps === undefined) {
          if (Array.isArray(child.props.itemsPerPage)) {
            config.paginationProps = {
              itemsPerPage: child.props.itemsPerPage[0],
              itemsPerPageOptions: child.props.itemsPerPage,
            };
          } else {
            config.paginationProps = {
              itemsPerPage: child.props.itemsPerPage ?? 10,
              itemsPerPageOptions: null,
            };
          }
          config.paginationProps.areaPadding = child.props.areaPadding
        } else {
          throw new Error("Found 1+ `DataTable.Pagination`s inside of `DataTable`.");
        }
      } else if (child?.type?.displayName === "HeadAreaConfig") {
        if (config.headArea === undefined) {
          config.headArea = child.props.children;
        }
      }
    });

    if (!config.headerAttrs) {
      config.headerAttrs = {};
    }

    config.colSpan = config.columns.filter(col => !col.foldable).length
    config.foldedColCount = config.columns.filter(col => col.foldable).length

    return config;
  }, [children, editable]);

  /** @type {[PaginationState, React.Dispatch<React.SetStateAction<PaginationState>>]} */
  const [pagination, setPagination] = useState({});
  const [serverDataLength, setServerDataLength] = useState(1);
  const [paginationLoaded, setPaginationLoaded] = useState(false);

  useEffect(() => {
    if (lazyLoading && !paginationLoaded) {
      setPagination({ areaPadding: paginationProps?.areaPadding, pageNo: 0, itemsPerPage: paginationProps?.itemsPerPage, itemsPerPageOptions: paginationProps?.itemsPerPageOptions });
      setPaginationLoaded(true);
    }
    if (!lazyLoading) {
      if (!dontRefreshPagination || !paginationLoaded) {
        setPagination({ areaPadding: paginationProps?.areaPadding, pageNo: 0, itemsPerPage: paginationProps?.itemsPerPage, itemsPerPageOptions: paginationProps?.itemsPerPageOptions });
        setPaginationLoaded(true);
      }
    }
    if (typeof onPaginationLoaded == 'function') onPaginationLoaded();
  }, [paginationProps]);

  useEffect(() => {
    if (handle?.current) {
      handle.current.pagination = pagination;
    }
  }, [handle, pagination]);

  useEffect(() => {
    if (handle?.current) {
      handle.current.setServerDataLength = setServerDataLength;
    }
  }, [handle, setServerDataLength]);
  const mutate = useCallback(
    (itemId, colKey) => {
      return (event) => {
        console.debug("mutating", itemId, colKey);
        const rowIdx = data.findIndex((item) => item[idKey] === itemId);
        const column = columns.find((col) => col.colKey === colKey);

        // Column is a Select
        if (column.selectConfig) {
          const selected = column.selectConfig.options.find((opt) => opt[column.selectConfig.optionIdKey]?.toString() === event.target.value);
          return setLocalData((old) => {
            const newer = [...old];
            newer[rowIdx][colKey] = selected;
            return [...newer];
          });
        }
        if (column.checkboxConfig) {
          return setLocalData((old) => {
            const newer = [...old];
            newer[rowIdx][colKey] = event.target.checked
            return [...newer]
          })
        }

        // Use 'beforeChange' middleware function it is exists.
        const newValue = typeof column.beforeChange === "function" ? column.beforeChange(event.target.value) : event.target.value;
        // If the new value is undefined, null, or NaN - don't update the value.
        // `Input`s only expect strings or number; anything else could cause undefined behaviour.
        if (newValue === undefined || newValue === null || Number.isNaN(newValue)) return;

        setLocalData((old) => {
          const newer = [...old];
          newer[rowIdx][colKey] = newValue;
          return [...newer];
        });
      };
    },
    [data, columns, idKey]
  );

  // When the handle is registered (or the mutation function changes), attach the mutate function.
  useEffect(() => {
    if (handle?.current) {
      handle.current.mutate = mutate;
    }
  }, [handle, mutate]);

  const [filterStatus, setFilterStatus] = useState({
    filterByKey: undefined,
    filterText: "",
  });

  const [filterTimeout, setFilterTimeout] = useState(undefined);

  useEffect(() => {
    if (handle?.current) {
      handle.current.filterStatus = filterStatus;
      handle.current.setFilterStatus = setFilterStatus;
    }
  }, [handle, filterStatus]);

  const [sortStatus, setSortStatus] = useState({
    currentKey: undefined,
    currentDirection: undefined,
  });

  useEffect(() => {
    if (lazyLoading && filterStatus.filterByKey) {
      clearTimeout(filterTimeout);
      setFilterTimeout(setTimeout(filterUpdatedLazy, 1000))
    }
  }, [filterStatus])

  const filterUpdatedLazy = () => {
    setPagination(prev => ({ ...prev, pageNo: 0 }))
    onUpdate(setServerDataLength, {...pagination, pageNo: 0}, sortStatus, advancedSearchData, filterObjectFromFilterStatus())
  }

  const filterObjectFromFilterStatus = () => {
    if (!filterStatus.filterByKey || !filterStatus.filterText) return {}
    return {
      [filterStatus.filterByKey] : filterStatus.filterText
    }
  }

  useEffect(() => {
    if (handle?.current) {
      handle.current.sortStatus = sortStatus;
      handle.current.setSortStatus = setSortStatus;
    }
  }, [handle, sortStatus]);

  const sortOnKey = (key, direction) => {
    if (sortStatus.currentKey === key) {
      if (direction) {
        setSortStatus((prev) => ({ ...prev, currentKey: key, direction }));
        if (lazyLoading && typeof onUpdate == 'function') onUpdate(setServerDataLength, { ...pagination, pageNo: 0 }, { ...sortStatus, currentKey: key, direction }, advancedSearchData, filterObjectFromFilterStatus())
        if (lazyLoading) setPagination(prev => ({ ...prev, pageNo: 0 }))
        return;
      }
      if (sortStatus.direction === "asc") {
        setSortStatus((prev) => ({ ...prev, currentKey: key, direction: "desc" }));
        if (lazyLoading && typeof onUpdate == 'function') onUpdate(setServerDataLength, { ...pagination, pageNo: 0 }, { ...sortStatus, currentKey: key, direction: 'desc' }, advancedSearchData, filterObjectFromFilterStatus())
        if (lazyLoading) setPagination(prev => ({ ...prev, pageNo: 0 }))
      } else {
        setSortStatus((prev) => ({ ...prev, currentKey: key, direction: "asc" }));
        if (lazyLoading && typeof onUpdate == 'function') onUpdate(setServerDataLength, { ...pagination, pageNo: 0 }, { ...sortStatus, currentKey: key, direction: 'asc' }, advancedSearchData, filterObjectFromFilterStatus())
        if (lazyLoading) setPagination(prev => ({ ...prev, pageNo: 0 }))
      }
      return;
    }

    setSortStatus({ currentKey: key, direction: direction ?? "asc" });
    if (lazyLoading && typeof onUpdate == 'function') onUpdate(setServerDataLength, { ...pagination, pageNo: 0 }, { ...sortStatus, currentKey: key, direction: direction ?? 'asc' }, advancedSearchData, filterObjectFromFilterStatus())
    if (lazyLoading) setPagination(prev => ({ ...prev, pageNo: 0 }))
  };

  const setFilterKey = (key) => setFilterStatus({ filterByKey: key, filterText: "" });
  const setFilterText = (text) => setFilterStatus((prev) => ({ ...prev, filterText: text }));

  useEffect(() => {
    if (!lazyLoading) {
      if (sortStatus.currentKey) {
        let multiplier;
        if (sortStatus.direction === "asc") {
          multiplier = 1;
        } else if (sortStatus.direction === "desc") {
          multiplier = -1;
        } else {
          return;
        }
        setLocalData((prev) => {
          const column = columns.find((col) => col.colKey === sortStatus.currentKey);
          const temp = [...prev];
          temp.sort((itemA, itemB) => {
            const valA = itemA[sortStatus.currentKey];
            const valB = itemB[sortStatus.currentKey];
            try {
              if (typeof column.sort === "function") {
                return column.sort(valA, valB) * multiplier;
              }
            } catch {
              return 0;
            }

            if (valA > valB) return multiplier;
            if (valA < valB) return -multiplier;
            return 0;
          });
          return [...temp];
        });
      }
    }

  }, [sortStatus, columns, lazyLoading]);

  const [searchOpen, setSearchOpen] = useState(false);

  const filteredData = useMemo(() => {
    let filtered = localData;
    if (filterStatus.filterByKey && filterStatus.filterText && !lazyLoading) {
      filtered = filtered.filter((row) => String(row[filterStatus.filterByKey]).toLowerCase()?.includes(filterStatus.filterText?.toLowerCase?.()));
    }
    return filtered;
  }, [localData, filterStatus, lazyLoading]);

  if (foldedColCount) {
    if (className.includes("table-striped")) {
      className = className.replace('table-striped', 'table-striped-foldable')
    }
  }

  const toggleRowExpanded = (value) => {
    setRowExpanded((prev) => {
      if (prev === value)
        return null
      return value
    })
  }

  const AdvancedSearch =()=>{
    const { pagination, advancedSearch, onUpdate, setAdvancedSearchData, setServerDataLength, setFilterKey } = useContext(DataTableContext);

    const clearSearch = (event) => {
      event.preventDefault();
      if (!lazyLoading) advancedSearch.onSubmit?.({});
      else {
        if (typeof onUpdate === "function")
          onUpdate(
            setServerDataLength,
            { ...pagination, pageNo: 0 },
            sortStatus,
            null
          );
        setPagination({ ...pagination, pageNo: 0 });
        setAdvancedSearchData(null);
      }
      setFilterKey("");
    };
    
    return(
      <div className="w-100 d-flex justify-content-end mb-2">
          <div className="d-flex">
            <button type="button" className="invoice-add-btn green-text" onClick={() => setSearchOpen(true)} style={{gap: '0.2rem'}}>
              <Search width="1.2rem" height="1.2rem" />
              <span className="text-decoration-underline " style={{ fontSize: "0.7rem", padding: "0.2rem 0"}}>
                Advanced
              </span>
            </button>
            <button type="button" className="invoice-add-btn" onClick={(e)=>clearSearch(e)} style={{alignSelf: 'center', color: '#db4e7b', gap: '0.1rem'}}>
              <span className="text-decoration-underline " style={{ fontSize: "0.7rem", padding: "0.2"}}>
                Reset
              </span>
            </button>
          </div>
        </div>
    )
  }

  const context = {
    columns,
    localData,
    headerAttrs,
    pagination,
    setPagination,
    mutate,
    sortable,
    sortOnKey,
    sortStatus,
    idKey,
    filterable,
    setFilterText,
    setFilterKey,
    filterStatus,
    filterObjectFromFilterStatus,
    advancedSearch,
    searchOpen,
    setSearchOpen,
    filteredData,
    lazyLoading,
    onUpdate,
    serverDataLength,
    setServerDataLength,
    advancedSearchData,
    setAdvancedSearchData,
    colSpan,
    foldedColCount,
    refreshTable,
    rowExpanded,
    toggleRowExpanded
  };
  
  return (
    <DataTableContext.Provider displayName="Datatable" value={context}>
      <SearchModal />
      {showAdvnSearch && <AdvancedSearch/>}
      <Table className={className ?? ""}>
        <thead>
          <Headers />
        </thead>
        <tbody>
          <Body rowProps={rowProps} />
        </tbody>
      </Table>
      {headArea}

      <Pagination data={filteredData} />
    </DataTableContext.Provider>
  );
};

const CustomOverlayTrigger = ({children, overlay}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({x: 0, y: 0})

  const ref = useRef();

  const getBoundingClientOffset = (element) => {
    let bodyRect = document.body.getBoundingClientRect(),
      elemRect = element.getBoundingClientRect(),
      y = elemRect.y - bodyRect.y,
      x = elemRect.x - bodyRect.x;
      x += elemRect.width;
    return { x, y };
  };

  useEffect(() => {
    window.x = ref;
  }, [])

  const onClose = (e) => {
    const filterComponent = document.getElementById("filterDropdown");
    if ((ref.current && ref.current.contains(e.target)) || (filterComponent && filterComponent.contains(e.target))) return;
    setOpen(false);
    document.body.removeEventListener('mousedown', onClose)
  }

  const onOpen = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!open) {
      setPosition(getBoundingClientOffset(e.target));
      setOpen(true);
      document.body.addEventListener('mousedown', onClose)
    }
  }
  return (
    <>
    <div onClick={onOpen}>
      {children}
    </div>
        <div ref={ref} 
        style={{position: 'absolute', 
        top: position.y, left: position.x, 
        backgroundColor: 'blue', 
        display: open ? 'block' : 'none'}}>
          {overlay}
        </div>
    </>

  )
}

function Headers() {
  const { columns, headerAttrs, sortable, filterable, foldedColCount } = useContext(DataTableContext);


  const headers = useMemo(() => {
    const row = [];
    if (foldedColCount) {
      row.push(
        <th
          key={"expand"}
          {...headerAttrs}
          // onClick={() => sortable && column.colKey && sortOnKey(column.colKey)}
          style={{ ...(headerAttrs.style ?? {}), width: '10px' }}
          className={(headerAttrs.className ?? "")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.2em" }}>
          <CustomOverlayTrigger trigger="click" placement="right" rootClose overlay={<MenuPopoverComponent colKey='jobRef' />}>
            <EllipsisV width={"0.33rem"} style={{color: '#262b2e', marginLeft: '10px', cursor: 'hand'}} />
          </CustomOverlayTrigger>

          </div>
        </th>
      );
    }
    for (const idx in columns.filter(col => !col.foldable)) {
      const column = columns.filter(col => !col.foldable)[idx];
      let maxWidthStyle = {};
      if (column.maxWidth) {
        maxWidthStyle = {
          maxWidth: column.maxWidth,
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        };
      }

      let filterIcon = (filterable || sortable) && column.colKey && <FilterPopover colKey={column.colKey} />;

      // Generates each header using the various configurations from columns, headerAttrs, etc.
      row.push(
        <th
          key={column.colKey ?? idx}
          {...headerAttrs}
          // onClick={() => sortable && column.colKey && sortOnKey(column.colKey)}
          style={{ ...maxWidthStyle, ...(headerAttrs.style ?? {}), ...(column.headerStyle ?? {}) }}
          className={(column.headerClassName ?? "") + " " + (headerAttrs.className ?? "")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.2em" }}>
            <span>{column.header}</span>
            {filterIcon}
          </div>
        </th>
      );
    }

    return row;
  }, [columns, headerAttrs, filterable, sortable]);

  return <tr>{headers}</tr>;
}

/**
 *
 * @param {{rowProps: RowProps}} props
 * @returns
 */
function Body({ rowProps }) {
  const { columns, pagination, mutate, idKey, filteredData, lazyLoading, colSpan, foldedColCount, refreshTable, rowExpanded, toggleRowExpanded } = useContext(DataTableContext);
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  const rows = [];
  const rowRefs = useRef([]).current;

  const computedData = useMemo(() => {
    if (pagination?.itemsPerPage && !lazyLoading) {
      return filteredData.slice(pagination.pageNo * pagination.itemsPerPage, (pagination.pageNo + 1) * pagination.itemsPerPage);
    }
    return filteredData;
  }, [pagination.itemsPerPage, pagination.pageNo, filteredData, lazyLoading]);

  useEffect(() => {
    if (refreshTable)
      setTimeout(timerFunction, refreshTable());
  }, [])

  const timerFunction = function() {
    forceUpdate();
    setTimeout(timerFunction, refreshTable());
  };

  const rowsIndex = [];
  const handleKeyDown = (e, index, colKey) => {
    if (e.key === "Enter" && colKey === "commcode") {
      e.preventDefault();
      let currentIndex = rowsIndex?.findIndex((rowIndex) => rowIndex === index);
      let nextFocusIndex = currentIndex === rowsIndex.length - 1 ? currentIndex : currentIndex + 1;
      rowRefs[rowsIndex[nextFocusIndex]].focus();
    }
  };

  for (const item of computedData) {
    rowsIndex.push(item[idKey]);
    const row = [];
    const fold = [];
    if (foldedColCount) {
      row.push(
        <td
          title={'expand'}
          style={{ width: '10px' }}
          key={`${item[idKey]}-expand`}
          onClick={() => {toggleRowExpanded(item[idKey])}}
        >
          <ChevronUp width={"0.6rem"} className="gray-text mx-2" style={{color: 'rgba(3, 50, 73)', cursor: 'hand', transition: 'transform 0.3s', transform: rowExpanded === item[idKey] ? '' : 'rotate(180deg)'}} />
        </td>
      );

    }
    for (const j in columns) {
      const col = columns[j];
      let maxWidthStyle = {};
      if (col.maxWidth) {
        maxWidthStyle = {
          maxWidth: col.maxWidth,
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        };
      }
      const overrides = {};
      let cell;

      const computedClassName = typeof col.className === "function" ? col.className(item) : col.className ?? "";
      const errorMessage = col.errorKey ? item[col.errorKey] : null;
      const cellEditable = typeof col.editable === 'function' ? col.editable(item) : col.editable;
      const cellLocked = typeof col.locked === 'function' ? col.locked(item) : col.locked;
      const cellFoldable = col.foldable;
      if (cellFoldable) {
                // Default content is just the item's [colKey] property. i.e. `item = {id: 1, text: "2"}` colKey = "text" -> "2"
                let innerJSX = item[col.colKey];
                // If the column component has children
                if (col.children !== undefined) {
                  if (typeof col.children === "function") {
                    // If the children is a render function, call the function with the current item as the 1st value.
                    innerJSX = col.children(item, { mutate });
                  } else if (React.isValidElement(col.children)) {
                    // If the children are 1 or more normal JSX children, clone them and render.
                    innerJSX = React.cloneElement(col.children);
                  } else {
                    // If the children are something else that can be rendered, render them.
                    innerJSX = col.children;
                  }
                }
        
        cell = (
          <div style={{marginRight: '50px'}} title={item[col.colKey]}>
            <h3 style={{fontSize: '12.4px'}}>{col.header}</h3>
            <p style={{fontSize: '9pt'}}>{innerJSX ?? ""}</p>
          </div>
        )
      }
      else if (cellEditable) {
        overrides.padding = "0px";
        overrides.height = "1px";

        if (col.selectConfig) {
          cell = (
            <td
              title={item[col.colKey]}
              style={{ ...maxWidthStyle, ...overrides }}
              key={`${item[idKey]}-${col.colKey ?? j}`}
              onClick={(event) => col.onClick?.(event, item)}
            >
              <ConditionalWrapper
                condition={errorMessage}
                wrapper={(children) => (
                  <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="bottom"
                    overlay={
                      <Popover id="popover-basic">
                        <div className="px-2 py-1 alert-warning">{errorMessage}</div>
                      </Popover>
                    }
                  >
                    {children}
                  </OverlayTrigger>
                )}
              >


                <select
                  type={col.type}
                  disabled={cellLocked}
                  value={item[col.colKey]?.[col.selectConfig.optionIdKey] ?? item[col.colKey]}
                  onChange={mutate(item[idKey], col.colKey)}
                  style={{ ...col.style, width: "100%", height: "100%", paddingLeft: '2px', textAlign: 'left', fontSize: '1rem', color: '#293d85',  border: errorMessage ? "1px solid red" : "1px solid #eeecf8", background: "transparent" }}
                  className={computedClassName ?? ""}
                >

                  <option value=""> - Select - </option>
                  {col.selectConfig.options.map((opt) => (
                    <option key={opt[col.selectConfig.optionIdKey]} value={opt[col.selectConfig.optionIdKey]}>
                      {opt[col.selectConfig.optionDisplayKey]}
                    </option>
                  ))}
                </select>
              </ConditionalWrapper>
            </td>
          );
        } else if (col.checkboxConfig) {
          cell = (
            <td
              title={item[col.colKey]}
              style={{ ...maxWidthStyle, ...overrides, display: 'flex', justifyContent: 'center', marginTop: '10px' }}
              key={`${item[idKey]}-${col.colKey ?? j}`}
              onClick={(event) => col.onClick?.(event, item)}
            >
              <ConditionalWrapper
                condition={errorMessage}
                wrapper={(children) => (
                  <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="bottom"
                    overlay={
                      <Popover id="popover-basic">
                        <div className="px-2 py-1 alert-warning">{errorMessage}</div>
                      </Popover>
                    }
                  >
                    {children}
                  </OverlayTrigger>
                )}
              >
                <input
                  type='checkbox'
                  checked={item[col.colKey]}
                  onClick={mutate(item[idKey], col.colKey)}
                  style={{ ...col.style, background: 'transparent' }}
                  className={computedClassName ?? ""}
                />
              </ConditionalWrapper>
            </td>
          );
        } 
        else {
          cell = (
            <td
              title={item[col.colKey]}
              style={{ ...maxWidthStyle, ...overrides }}
              key={`${item[idKey]}-${col.colKey ?? j}`}
              onClick={(event) => col.onClick?.(event, item)}
            >
              <ConditionalWrapper
                condition={errorMessage}
                wrapper={(children) => (
                  <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="bottom"
                    overlay={
                      <Popover id="popover-basic">
                        <div className="px-2 py-1 alert-warning">{errorMessage}</div>
                      </Popover>
                    }
                  >
                    {children}
                  </OverlayTrigger>
                )}
              >
                <input
                  type={col.type}
                  ref={(el) => {                    
                    if(col.colKey === "commcode"){                     
                      rowRefs[item[idKey]] = el;                   
                    }               
                  }}
                  value={item[col.colKey]}
                  onChange={mutate(item[idKey], col.colKey)}
                  onKeyDown={(e) =>handleKeyDown(e, item[idKey], col.colKey)}
                  style={{ ...col.style, width: "100%", height: "100%", border: errorMessage ? "1px solid red" : "none", background: "transparent" }}
                  className={computedClassName ?? ""}
                />
              </ConditionalWrapper>
            </td>
          );
        }
      } else {
        // Default content is just the item's [colKey] property. i.e. `item = {id: 1, text: "2"}` colKey = "text" -> "2"
        let innerJSX = item[col.colKey];
        // If the column component has children
        if (col.children !== undefined) {
          if (typeof col.children === "function") {
            // If the children is a render function, call the function with the current item as the 1st value.
            innerJSX = col.children(item, { mutate });
          } else if (React.isValidElement(col.children)) {
            // If the children are 1 or more normal JSX children, clone them and render.
            innerJSX = React.cloneElement(col.children);
          } else {
            // If the children are something else that can be rendered, render them.
            innerJSX = col.children;
          }
        }

        cell = (
          <td
            title={item[col.colKey]}
            style={{ ...maxWidthStyle, ...col.style, ...overrides }}
            className={computedClassName}
            key={`${item[idKey]}-${col.colKey ?? j}`}
            onClick={(event) => col.onClick?.(event, item)}
          >
            <ConditionalWrapper
              condition={errorMessage}
              wrapper={(children) => (
                <OverlayTrigger
                  trigger={["hover", "focus"]}
                  placement="bottom"
                  overlay={
                    <Popover id="popover-basic">
                      <div className="px-2 py-1 alert-warning">{errorMessage}</div>
                    </Popover>
                  }
                >
                  {children}
                </OverlayTrigger>
              )}
            >
              {innerJSX ?? ""}
            </ConditionalWrapper>
          </td>
        );
      }

      // Apply column specific styles, classes, click handlers etc to each `td` cell, and insert the JSX into it.
      if (col.foldable)
        fold.push(cell);
      else
        row.push(cell)
    }

    const rowClass = typeof rowProps?.className === "function" ? rowProps.className(item) : rowProps?.className;
    const rowStyle = typeof rowProps?.style === "function" ? rowProps.style(item) : rowProps?.style;
    rows.push(
      <tr key={item[idKey]} className={rowClass} style={rowStyle} >
        {row}
      </tr>
    );
    if (foldedColCount) {
      rows.push(
        <tr key={item[idKey]+"-content"} style={{display: rowExpanded === item[idKey] ? 'table-row' : 'none'}} >
          <td colspan={colSpan+1}>
            <div className="d-flex flex-row align-content-start align-items-start">
              {/* <img src={drArrow} alt="expanded" width="30px" style={{marginLeft: '20px', paddingRight: '10px' ,paddingTop: '10px'}} /> */}
              <div className="d-flex flex-row align-content-start flex-wrap" style={{paddingTop: '1rem', marginLeft: '13.26rem'}}>
                {fold}
              </div>
            </div>
          </td>
          </tr>
      )
    }
  }

  if (rows.length === 0) {
    return (
      <tr>
        <td colSpan={columns.length} className="text-center italic" style={{fontSize: '13px', fontWeight:'400', color:'#de6060'}}>
          No records found
        </td>
      </tr>
    )
  }

  return rows;
}


const MenuPopoverComponent = React.forwardRef(({ style, ...props }, ref) => {
  const { sortStatus, sortOnKey, filterStatus, columns } = useContext(DataTableContext);

  const foldedCols = useMemo(() => {
    return columns.filter(col => col.foldable && col.colKey)
  }, [columns])

  return (
    <Popover ref={ref} {...props} style={{ ...style, maxWidth: "300px" }}>
      <div className="py-2">
          {foldedCols.map(col => {
            return(
              <OverlayTrigger trigger="click" placement="right" rootClose overlay={<FilterPopoverComponent colKey={col.colKey} />}>
                <div className='foldable-menu-item ' >
                  <div class="d-flex flex-row justify-content-between">
                    <div className={((sortStatus.currentKey && sortStatus.currentKey === col.colKey) || (filterStatus.filterByKey && filterStatus.filterText && filterStatus.filterByKey === col.colKey) ? 'bold' : '')}>
                    {col.header}
                    </div>
                    <div>
                    <ChevronUp width={"0.7rem"} className="gray-text mx-2" style={{transform: 'rotate(-90deg)'}} />
                    </div>
                  </div>
                </div>
              </OverlayTrigger>
            )

          })}
      </div>
    </Popover>
  );
});




const FilterPopoverComponent = React.forwardRef(({ popper, children, style, colKey, ...props }, ref) => {
  const { sortStatus, sortOnKey, filterStatus, setFilterText, setFilterKey, sortable, filterable } = useContext(DataTableContext);

  // Force popper to reposition element when we change the sort/filter; as the table size may have changed
  useEffect(() => {
    popper.scheduleUpdate();
  }, [sortStatus.currentKey, sortStatus.direction, filterStatus.filterText, popper]);

  // When we open this filter, filter the filter input (if it exists)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const inputRef = useRef();

  return (
    <div id="filterDropdown">
<Popover ref={ref} {...props} style={{ ...style, maxWidth: "300px" }}>
      <div className="py-2">
        <section className="px-3">
          {sortable && (
            <>
              <h6 className="text-eoriblue mt-2">Sort</h6>
              <div className="d-flex justify-content-between gap-2 mb-3">
                <button
                  onClick={() => sortOnKey(colKey, "asc")}
                  className={`sort-btn ${sortStatus.direction === "asc" && sortStatus.currentKey === colKey ? "active" : ""}`}
                >
                  <span>Ascending</span>
                  <SortUp style={{ width: "0.8rem", height: "0.8rem" }} />
                </button>
                <button
                  onClick={() => sortOnKey(colKey, "desc")}
                  className={`sort-btn  ${sortStatus.direction === "desc" && sortStatus.currentKey === colKey ? "active" : ""}`}
                >
                  <span>Descending</span>
                  <SortDown style={{ width: "0.8rem", height: "0.8rem" }} />
                </button>
              </div>
            </>
          )}
          {filterable && (
            <Input
              label={<h6 className="text-eoriblue mb-0">Filter By</h6>}
              // info={<button className="border-0 bg-transparent p-1"><Times width="1rem" height="1rem" color="red" /></button>}
              inputRef={inputRef}
              value={filterStatus.filterByKey === colKey ? filterStatus.filterText : ""}
              onChange={(e) => {
                if (filterStatus.filterByKey !== colKey) {
                  setFilterKey(colKey);
                }
                setFilterText(e.target.value);
              }}
            />
          )}
        </section>
      </div>
    </Popover>
    </div>
  );
});

function FilterPopover({ colKey }) {
  const { sortStatus, filterStatus } = useContext(DataTableContext);
  return (
    <OverlayTrigger trigger="click" placement="right" rootClose overlay={<FilterPopoverComponent colKey={colKey} />}>
      <span className={`filter-icon ${sortStatus.currentKey === colKey || filterStatus.filterByKey === colKey ? "active" : ""}`} style={{ padding: '0.1rem' }}>
        <FilterIcon style={{ width: "1.2em", height: "1.2em", color: '#f00c0c' }} className="green-text" />
      </span>
    </OverlayTrigger>
  );
}

function SearchModal() {
  const { columns, searchOpen, setSearchOpen, advancedSearch, setAdvancedSearchData, lazyLoading, onUpdate, setServerDataLength, pagination, sortStatus, setPagination } = useContext(DataTableContext);
  const [local, setLocal] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const noEmpty = Object.fromEntries(Object.entries(local).filter(([key, value]) => value !== undefined && value !== null && String(value).trim() !== ''));
    if (lazyLoading) {
      setAdvancedSearchData(noEmpty);
      if (typeof onUpdate === 'function')
        onUpdate(setServerDataLength, { ...pagination, pageNo: 0 }, sortStatus, noEmpty)
      setPagination({ ...pagination, pageNo: 0 })
    }
    else {
      advancedSearch.onSubmit?.(noEmpty);
    }
    setSearchOpen(false);
  };

  const clearData = () => {
    setLocal((prev) => {
      const entries = Object.entries(prev);
      return Object.fromEntries(entries.map(([k]) => [k, ""]));
    });
  };

  return (
    <Modal centered size="md" show={searchOpen} onHide={() => setSearchOpen(false)}>
      <Modal.Title className="px-3 py-2">Search</Modal.Title>
      <form onSubmit={handleSubmit}>
        <Modal.Body className="d-flex flex-column gap-1">
          {columns.map(
            ({ colKey, searchOpts, header }) =>
              searchOpts && <ModalField key={colKey} colKey={colKey} header={header} searchOpts={searchOpts} local={local} setLocal={setLocal} />
          )}
        </Modal.Body>
        <Modal.Footer
          className="d-flex flex-row py-3 px-3 gap-3 border-top bg-light align-items-center"
          style={{ borderBottomLeftRadius: "20px", borderBottomRightRadius: "20px" }}
        >
          <button type="button" class="stepper-button red" onClick={clearData} style={{ display: "flex", borderRadius: "10px" }}>
            Clear
          </button>
          <div className="flex-grow-1" />
          <button type="button" class="cancel-button" onClick={() => setSearchOpen(false)} style={{ display: "flex", borderRadius: "10px" }}>
            Cancel
          </button>
          <button type="submit" class="stepper-button" style={{ borderRadius: "10px" }}>
            Search
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

/**
 *
 * @param {Object} props
 * @param {string} props.colKey
 * @param {string} props.header
 * @param {Record<string, string>} props.local
 * @param {React.Dispatch<React.SetStateAction<Record<string, string>>>} props.setLocal
 * @param {ColumnSearchConfig} props.searchOpts
 * @returns
 */
function ModalField({ colKey, header, local, searchOpts, setLocal }) {
  const { localData } = useContext(DataTableContext);

  const selectOptions = useMemo(() => {
    if (searchOpts.type === "select") {
      if (searchOpts.src === "data") {
        const uniqueOpts = new Set();
        for (const item of localData) {
          uniqueOpts.add(item[colKey]);
        }
        return [...uniqueOpts].map((text) => ({ id: text, data: text }));
      } else if (Array.isArray(searchOpts.src)) {
        return searchOpts.src;
      }
    }
    return [];
  }, [localData, searchOpts.type, searchOpts.src, colKey]);

  const sendAs = useMemo(() => searchOpts.sendAs ?? colKey, [colKey, searchOpts.sendAs]);

  if (searchOpts.type === "text") {
    return <Input label={header} type="text" value={local[sendAs] ?? ""} onChange={(e) => setLocal((prev) => ({ ...prev, [sendAs]: e.target.value }))} />;
  } else if (searchOpts.type === "select") {
    return (
      <Select label={header} data={local[sendAs] ?? ""} setData={(data) => setLocal((prev) => ({ ...prev, [sendAs]: data }))} options={selectOptions}></Select>
    );
  } else if (searchOpts.type === "date") {
    const from = (
      <Input
        type="date"
        label="From"
        value={local[`${sendAs}From`] ?? ""}
        onChange={(e) => setLocal((prev) => ({ ...prev, [`${sendAs}From`]: e.target.value }))}
        max={local[`${sendAs}To`] ?? new Date().toISOString().slice(0, 10)}
      />
    );
    const to = (
      <Input
        type="date"
        label="To"
        value={local[`${sendAs}To`] ?? ""}
        onChange={(e) => setLocal((prev) => ({ ...prev, [`${sendAs}To`]: e.target.value }))}
        min={local[`${sendAs}From`]}
        max={new Date().toISOString().slice(0, 10)}
      />
    );

    return (
      <>
        <h6 className="text-eoriblue mt-2">{header}</h6>
        <Row>
          <Col>{from}</Col>
          <Col>{to}</Col>
        </Row>
      </>
    );
  } else if (searchOpts.type === "number") {
    return (
      <Input
        label={header}
        type="number"
        value={local[sendAs] ?? ""}
        onChange={(e) => setLocal((prev) => ({ ...prev, [sendAs]: e.target.value }))}
        min={searchOpts.min}
        max={searchOpts.max}
      />
    );
  }

  return null;
}

/**
 * Specifies how to display a specific column,
 * identified in any given `item` via `colKey`.
 * @param {ColumnProps} props
 * @returns {null}
 */
function Column(props) {
  return null;
}

/**
 * Passes all provided props to all `<th>` element created by this table.
 * Can be overwritten on a `Column` basis using `headerStyle` and `headerClassName`.
 * @param {import("react").HTMLAttributes} props
 * @returns {null}
 */
function HeadersConfig(props) {
  return null;
}

/**
 * Configuration for pagination on the table, if supplied pagination will be enabled and
 * a pagination element will be rendered
 * @param {PaginationProps} props
 * @returns {null}
 */
function PaginationConfig(props) {
  return null;
}

/**
 * Default row configuration.
 * @param {RowProps} props
 * @returns {null}
 */
function RowConfig(props) {
  return null;
}

function HeadAreaConfig(props) {
  return null;
}

/**
 *
 * @param {SelectConfig} props
 * @returns {null}
 */
function SelectConfig(props) {
  return null;
}

/**
 *
 * @param {CheckboxConfig} props
 * @returns {null}
 */
function CheckboxConfig(props) {
  return null;
}

Column.displayName = "Column";
HeadersConfig.displayName = "HeadersConfig";
PaginationConfig.displayName = "PaginationConfig";
SelectConfig.displayName = "SelectConfig";
RowConfig.displayName = "RowConfig";
HeadAreaConfig.displayName = "HeadAreaConfig";
CheckboxConfig.displayName = "CheckboxConfig"

DataTable.Column = Column;
DataTable.Headers = HeadersConfig;
DataTable.Pagination = PaginationConfig;
DataTable.Select = SelectConfig;
DataTable.Row = RowConfig;
DataTable.Checkbox = CheckboxConfig;
DataTable.Head = HeadAreaConfig

export default DataTable;
