"use client";

import React from "react";
import { useFileManager } from "../../context/file-manager-context";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "../ui/pagination";
import { Button } from "../ui/button";

import ChevronRightIcon from "../icons/chevron-right";
import ChevronLeftIcon from "../icons/chevron-left";


// Helper to generate page numbers with ellipsis for pagination
function getPageNumbers(current: number, total: number) {
  const pages: (number | 'ellipsis')[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, 'ellipsis', total);
  } else if (current >= total - 3) {
    pages.push(1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total);
  }
  return pages;
}

export function FileManagerFooter() {
  const { pagination, handlePageChange } = useFileManager();
  const { currentPage, totalPages } = pagination;
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            asChild
            disabled={currentPage === 1}
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
          >
            <span>
              <ChevronLeftIcon className="rtl:rotate-180" /> Previous
            </span>
          </Button>
        </PaginationItem>
        {pageNumbers.map((page, idx) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${currentPage}-${totalPages}-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <Button
                variant={page === currentPage ? 'outline' : 'ghost'}
                mode="icon"
                asChild
                onClick={() => handlePageChange(page)}
                disabled={page === currentPage}
              >
                <span>{page}</span>
              </Button>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <Button
            variant="ghost"
            asChild
            disabled={currentPage === totalPages}
            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
          >
            <span>
              Next <ChevronRightIcon className="rtl:rotate-180" />
            </span>
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
