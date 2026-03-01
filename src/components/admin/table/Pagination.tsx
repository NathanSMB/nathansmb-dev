import Button from "~/components/ui/Button";
import "./Pagination.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Pagination(props: PaginationProps) {
  return (
    <div class="admin-pagination">
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
    </div>
  );
}
