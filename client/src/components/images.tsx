type ImagesProps = {
  links: string[]
}

const Images = ({ links }: ImagesProps) => {
  return (
    <div 
      className="image-columns-container"
      style={{
        columnCount: window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3,
        columnGap: '12px',
        padding: '0 12px'
      }}
    >
      {links.map((src: string, i: number) => (
        <div 
          key={i} 
          className="image-item"
          style={{ 
            breakInside: 'avoid',
            marginBottom: '12px',
          }}
        >
          <img
            src={src}
            alt={`Uploaded ${i}`}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              border: 'none',
              borderRadius: '0px',
              display: 'block'
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default Images