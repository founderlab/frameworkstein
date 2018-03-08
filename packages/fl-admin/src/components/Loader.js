import React, {PropTypes} from 'react'

export default function Loader(props) {
  if (props.inline) return (<span>loading...</span>)
  return (
    <section>
      <div className="container">
        <div className="row">
          <div className="col-lg-12">

            <div className="cssload-thecube">
              <div className="cssload-cube cssload-c1"></div>
              <div className="cssload-cube cssload-c2"></div>
              <div className="cssload-cube cssload-c4"></div>
              <div className="cssload-cube cssload-c3"></div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

Loader.propTypes = {
  inline: PropTypes.string,
}
