import Button from "~/components/ui/Button";
import Select from "~/components/ui/Select";
import "./Pagination.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  pageSize: number;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 / page" },
  { value: "25", label: "25 / page" },
  { value: "50", label: "50 / page" },
  { value: "100", label: "100 / page" },
];

export default function Pagination(props: PaginationProps) {
  return (
    <div class="admin-pagination">
      <div class="admin-pagination-nav">
        <Button
          variant="pagination"
          disabled={!props.hasPrevious}
          onClick={props.onFirst}
        >
          First
        </Button>
        <Button
          variant="pagination"
          disabled={!props.hasPrevious}
          onClick={props.onPrevious}
        >
          Previous
        </Button>
        <span>
          Page {props.page + 1} of {props.totalPages}
        </span>
        <Button
          variant="pagination"
          disabled={!props.hasNext}
          onClick={props.onNext}
        >
          Next
        </Button>
        <Button
          variant="pagination"
          disabled={!props.hasNext}
          onClick={props.onLast}
        >
          Last
        </Button>
      </div>
      <Select
        value={String(props.pageSize)}
        options={PAGE_SIZE_OPTIONS}
        onChange={(v) => props.onPageSizeChange(parseInt(v))}
        class="pagination-size-select"
      />
    </div>
  );
}
